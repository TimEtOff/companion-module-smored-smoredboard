import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import WebSocket from 'ws';

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
	public profileGuid: string | undefined

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions

		const ws = new WebSocket(`ws://${config.host}:${config.port}`)
		this.ws = ws

		this.log('debug', 'test start lolol')

		ws.on('error', (err) => {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Connection error')
			this.log('debug', 'Socket connect error: ' + err)
		})

		ws.on('open', () => {
			this.connect()
		})

		ws.on('message', (msg_data) => {
			this.log('debug', 'Received: ' + msg_data)

			var res = JSON.parse(msg_data.toString())


			if (res['Action'] == 'Invalid Authentication') {
				this.updateStatus(InstanceStatus.AuthenticationFailure, "Check the Token in the config")
			}

			if (!res['Success']) {
				this.log('error', `Error on ${res['Action']}: (${res['ErrorCode']}) ${res['Message']}`)
			} else {
				if (res['Action'] == 'Hello') {
					this.updateStatus(InstanceStatus.Ok)
					this.log('info', 'Successfully reached server and authenticated. Now setting profile')
					this.sendPacket("GetProfiles")
				} else if (res['Action'] == 'GetProfiles') {
					if (res['Profiles'].length != 0) {
						for (const profile of res['Profiles']) {
							if (profile['name'] == config.profileName)
								this.profileGuid = profile['Id']
						}

						if (config.profileName == undefined || this.profileGuid == undefined) {
							this.profileGuid = res["Profiles"][0]["Id"]
						}
					} else {
						this.updateStatus(InstanceStatus.ConnectionFailure)
					}
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

	playSound(fullPath: string): void {
		var msg = {
		  SoundPath: fullPath,
		  ProfileGuid: this.profileGuid
		}

		this.sendPacket("PlaySound", msg)
		this.log('debug', `Play sound '${fullPath}'`)
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
