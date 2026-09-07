import type ModuleInstance from './main.js'

export type ActionsSchema = {
	play_sound: {
		options: {
			path: string
		}
	},
	stop_all_sounds: {
		options: {}
	}
}

// TODO Specific stop sound because Play Sound doesnt respect Click Action (always overlap)
export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		play_sound: {
			name: 'Play Sound',
			options: [
				{
					id: 'path',
					type: 'textinput',
					label: 'Sound full path',
					description: 'In Smoredboard, right click on a sound > Open Sound File in Explorer > Copy the path to the file'
				},
			],
			callback: async (event) => {
				var msg = {
				  Action: "PlaySound",
				  Token: "SMORED1999VERYGOODANDCOOL",
				  SoundPath: event.options.path,
				  ProfileGuid: self.profileGuid
				}

				self.ws?.send(JSON.stringify(msg))
				console.log(`Play sound '${event.options.path}'`)
			},
		},
		stop_all_sounds: {
			name: 'Stop All Sounds',
			options: [],
			callback: async () => {
				var msg = {
				  Action: "StopAllSounds",
				  Token: "SMORED1999VERYGOODANDCOOL",
				  ProfileGuid: self.profileGuid
				}

				self.ws?.send(JSON.stringify(msg))
				console.log(`Stopped all sounds`)
			},
		}
	})
}
