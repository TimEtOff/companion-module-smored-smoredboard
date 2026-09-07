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

		this.updateStatus(InstanceStatus.Ok)

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
			this.updateStatus(InstanceStatus.Ok)
			this.log('debug', 'Connected!')
			var req = {
			  Action: "GetProfiles",
			  Token: "SMORED1999VERYGOODANDCOOL",
			}
			ws.send(JSON.stringify(req))
		})

		ws.on('message', (msg_data) => {
			this.log('debug', 'Received: ' + msg_data)

			var res = JSON.parse(msg_data.toString())

			if (!res['Success']) {
				this.log('info', `Action failed (${res['Action']})`)
			} else {
				if (res['Action'] == 'GetProfiles') {
					for (const profile of res['Profiles']) {
						if (profile['name'] == config.profileName)
							this.profileGuid = profile['Id']
					}

					if (config.profileName == undefined || this.profileGuid == undefined) {
						this.profileGuid = res["Profiles"][0]["Id"]
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
