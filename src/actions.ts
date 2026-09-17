import type ModuleInstance from './main.js'

export type ActionsSchema = {
	add_sound: {
		options: {
			profile: string,
			sound: string,
		}
	},
	stop_all_sounds: {
		options: {
			immediately: boolean,
		}
	},
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		add_sound: {
			name: 'Add Sound',
			description: 'Play a sound from a profile',
			options: [
				{
					id: 'profile',
					type: 'dropdown',
					label: 'Select a profile',
					choices: [
						{ id: 'null', label: '---'},
						...(self.getProfilesDropdown() || []),
					],
					default: 'null',
					disableAutoExpression: true,
				},
				{
					id: 'sound',
					type: 'dropdown',
					label: 'Select a sound',
					description: 'The profile name on the sound must be the same as the one selected above',
					choices: [
						{ id: 'null', label: '---'},
						...(self.getSoundsDropdown() || []),
					],
					default: 'null',
					isVisibleExpression: '$(options:profile) != "null"',
					disableAutoExpression: true,
				},
			],
			callback: async (event) => {
				if (event.options.profile != 'null' &&
					event.options.sound != 'null') {
					self.playSound(event.options.profile, event.options.sound)
				}
			},
		},
		stop_all_sounds: {
			name: 'Stop All Sounds',
			options: [
				{
					id: 'immediately',
					type: 'checkbox',
					'label': 'Stop immediately',
					default: false
				}
			],
			callback: async (event) => {
				if (event.options.immediately) {
					self.sendPacket('StopAllSoundsImmediately')
				} else {
					self.sendPacket('StopAllSounds')
				}
			},
		}
	})
}
