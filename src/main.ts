import { InstanceBase, InstanceStatus, type DropdownChoice, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { SetImages } from './images.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import WebSocket from 'ws';
import { readFileSync } from 'fs'
import { lookup } from 'mime-types'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig // Setup in init()
	public ws: WebSocket | undefined
	/**
	 * ```json
	 * {
	 * 		"{profileGuid}": {
	 * 			"ProfileName": string
	 * 			"ImagePath": string
	 * 			"Sounds": [ {result of GetProfileSounds} ],
	 * 			"VoiceChangers": [ {result of GetProfileVoiceChangers} ]
	 * 		},
	 * 		...
	 * }
	 */
	public profilesData: object | any

	constructor(internal: unknown) {
		super(internal)
		this.profilesData = {}
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions
		SetImages(this)

		const ws = new WebSocket(`ws://${config.host}:${config.port}`)
		this.ws = ws

		ws.on('error', (err) => {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Connection error')
			this.log('error', 'Socket connect error: ' + err)
		})

		ws.on('open', () => {
			this.connect()
		})

		ws.on('message', (msg_data) => {
			var res = JSON.parse(msg_data.toString())


			if (res['Action'] == 'Invalid Authentication') {
				this.updateStatus(InstanceStatus.AuthenticationFailure, "Check the Token in the config")
			}

			if (!res['Success']) {
				this.log('error', `Error on ${res['Action']}: (${res['ErrorCode']}) ${res['Message']}`)
			} else {
				if (res['Action'] == 'Hello') {
					this.updateStatus(InstanceStatus.Ok)
					this.log('info', 'Successfully reached server and authenticated. Now getting profiles')
					this.sendPacket("GetProfiles")

				} else if (res['Action'] == 'GetProfiles') {
					this.updateProfiles(res['Profiles'])

				} else if (res['Action'] == 'GetProfileSounds') {
					this.updateSounds(res['ProfileGuid'], res['Sounds'])

				} else if (res['Action'] == 'GetProfileVoiceChangers') {
					this.updateVoiceChangers(res['ProfileGuid'], res['VoiceChangers'])

				} else if (res['Action'] == 'IsSoundPlayingStreamdeck') {
					this.handleIsSoundPlaying(res['Message'], res['SoundPath'])

				} else if (res['Action'] == 'SoundFinished') {
					this.handleSoundFinished(res['SoundPath'])

				} else if (res['Action'] == 'StopAllSounds') {
					this.log('info', 'Stopped all sounds')

				} else if (res['Action'] == 'StopAllSoundsImmediately') {
					this.log('info', 'Stopped all sounds immediatly')

				} else if (res['Action'] == 'GetSFXInfo') {
					var data = res['Message'].split(' |+| ')
					if (data.length == 2) {
						if (data[1].startsWith('data:')) {
							this.setSoundImage(data[0], data[1])
						} else if (data[1].length != 0) {
							var encoded = readFileSync(data[1], 'base64')
							encoded = 'data:' + lookup(data[1]) + ';base64,' + encoded
							this.setSoundImage(data[0], encoded)
						}
					}

				} else if (res['Action'] != '') {
					this.log('debug', 'Received (not handled): ' + msg_data)
				}
			}
		})
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.connect();
	}

	updateProfiles(profiles: object[] | any[]) {
		var updated = Object.keys(this.profilesData)
		for (const profile of profiles) {
			var guid = profile['Id']
			if (!(guid in this.profilesData)) {
				this.profilesData[guid] = {}
				this.profilesData[guid]['Sounds'] = []
				this.profilesData[guid]['VoiceChangers'] = []
			}

			this.profilesData[guid]['ProfileName'] = profile['name']
			this.profilesData[guid]['ImagePath'] = profile['ImagePath']

			var ind = updated.indexOf(guid)
			if (ind != -1) {
				updated.splice(ind, 1)
			}

			this.sendPacket('GetProfileSounds', { ProfileGuid: guid })
		}

		for (const guid of updated) {
			delete this.profilesData[guid]
		}
		this.updateActions()
		this.updateFeedbacks()
	}

	getProfilesDropdown(): DropdownChoice[] {
		var res: DropdownChoice[] = []
		for (const id of Object.keys(this.profilesData)) {
			res.push({ id: id, label: this.profilesData[id]['ProfileName'] })
		}
		return res
	}

	updateSounds(profileGuid: string, sounds: object[] | any[]) {
		if (profileGuid in this.profilesData) {
			this.profilesData[profileGuid]['Sounds'] = sounds
		}
		this.updateActions()
		this.updateFeedbacks()
	}

	getSoundsDropdown(): DropdownChoice[] {
		var res: DropdownChoice[] = []
		for (const guid of Object.keys(this.profilesData)) {
			for (const sound of this.profilesData[guid]['Sounds']) {
				res.push({ id: sound['SoundPath'], label: this.profilesData[guid]['ProfileName'] + ' - ' + sound['Name'] })
			}
		}
		return res
	}

	getSoundName(soundPath: string, profileGuid: string): string {
		for (const sound of this.profilesData[profileGuid]['Sounds']) {
			if (sound['SoundPath'] == soundPath)
				return sound['Name']
		}
		return ''
	}

	setSoundImage(soundPath: string, encodedImage: string) {
		if (!(encodedImage.startsWith("data:image/png;base64,") || encodedImage.startsWith("data:image/jpeg;base64,"))) {
			encodedImage = "";
		}

		for (const guid of Object.keys(this.profilesData)) {
			for (var i = 0; i < this.profilesData[guid]['Sounds'].length; i++) {
				if (this.profilesData[guid]['Sounds'][i]['SoundPath'] == soundPath) {
					this.profilesData[guid]['Sounds'][i]['EncodedImage'] = encodedImage
				}
			}
		}

		this.checkFeedbacks('external_sound_playing')
	}

	unsetSoundImage(soundPath: string) {
		for (const guid of Object.keys(this.profilesData)) {
			for (var i = 0; i < this.profilesData[guid]['Sounds'].length; i++) {
				if (this.profilesData[guid]['Sounds'][i]['SoundPath'] == soundPath) {
					this.profilesData[guid]['Sounds'][i]['EncodedImage'] = undefined
				}
			}
		}
	}

	getSoundImage(soundPath: string): string | undefined {
		for (const guid of Object.keys(this.profilesData)) {
			for (const sound of this.profilesData[guid]['Sounds']) {
				if (sound['SoundPath'] == soundPath && sound['EncodedImage'] != undefined) {
					return sound['EncodedImage']
				}
			}
		}
		return undefined
	}

	updateVoiceChangers(profileGuid: string, voiceChangers: object[] | any[]) {
		if (profileGuid in this.profilesData) {
			this.profilesData[profileGuid]['VoiceChangers'] = voiceChangers
		}
		this.updateActions()
	}

	sendPacket(action: string, fields = {}): void {
		var req = {
		  Action: action,
		  Token: this.config.token,
		  ...fields
		}
		this.ws?.send(JSON.stringify(req))
	}

	connect(): void {
		this.updateStatus(InstanceStatus.Connecting)
		this.sendPacket("Hello")
	}

	playSound(profileGuid: string, soundPath: string): void {
		var msg = {
			SoundPath: soundPath,
			ProfileGuid: profileGuid
		}

		this.sendPacket("SfxPressed", msg)

		this.sendPacket("IsSoundPlayingStreamdeck", { SoundPath: soundPath })
	}

	handleIsSoundPlaying(playing: string, soundPath: string) {
		if (playing == "true") {
			var currentPlaying = this.getVariableValue('playing_sounds')

			if (currentPlaying != undefined) {
				if (!currentPlaying.includes(soundPath)) {
					this.setVariableValues({
						'playing_sounds': [...currentPlaying, soundPath],
					})
				}
			} else {
				this.setVariableValues({
					'playing_sounds': [soundPath],
				})
			}

			this.log('info', `Sound playing '${soundPath}'`)
		} else {
			this.handleSoundFinished(soundPath, true)
		}

		this.checkFeedbacks('custom_sound_playing', 'external_sound_playing')
	}

	handleSoundFinished(soundPath: string, subcall = false) {
		var currentPlaying = this.getVariableValue('playing_sounds')

		if (currentPlaying != undefined) {
			var ind = currentPlaying.indexOf(soundPath)
			if (ind != -1) {
				currentPlaying.splice(ind, 1)
			}
			this.setVariableValues({
				'playing_sounds': currentPlaying,
			})
		}

		if (!subcall) {
			this.log('info', `Sound stopped '${soundPath}'`)
			this.checkFeedbacks('custom_sound_playing', 'external_sound_playing')
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}
