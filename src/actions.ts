import type ModuleInstance from './main.js'

export type ActionsSchema = {
	play_sound_full: {
		options: {
			path: string
		}
	},
	play_sound_relative: {
		options: {
			filename: string
		}
	},
	stop_all_sounds: {
		options: {}
	}
}

// TODO Specific stop sound because Play Sound doesnt respect Click Action (always overlap)
export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		play_sound_full: {
			name: 'Play Sound (full path)',
			description: 'PLay a sound from its full file path',
			options: [
				{
					id: 'path',
					type: 'textinput',
					label: 'Sound full path',
					description: 'In Smoredboard, right click on a sound > Open Sound File in Explorer > Copy the path to the file'
				},
			],
			callback: async (event) => {
				self.playSound(event.options.path)
			},
		},
		play_sound_relative: {
			name: 'Play Sound (relative)',
			description: 'Play a sound from the folder set in the config',
			options: [
				{
					id: 'filename',
					type: 'textinput',
					label: 'Sound file name',
					description: '/!\\ NOT SOUND NAME, the file name. In Smoredboard, right click on a sound > Open Sound File in Explorer > Copy the file name with the extension'
				},
			],
			callback: async (event) => {
				if (self.config.soundsFolder != undefined) {
					self.playSound(self.config.soundsFolder + event.options.filename)
				} else {
					self.log('error', 'Sounds folder is not set in the config')
				}
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
