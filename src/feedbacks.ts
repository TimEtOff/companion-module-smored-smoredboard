import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	custom_sound_playing: {
		type: 'boolean'
		options: {
			profile: string,
			sound: string,
		}
	},
	external_sound_playing: {
		type: 'advanced'
		options: {
			showName: boolean,
			image_warning: undefined,
			profile: string,
			sound: string,
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		custom_sound_playing: {
			name: 'Custom sound playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0xff0000,
				color: 0x000000,
			},
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
			callback: (feedback) => {
				if (feedback.options.profile != 'null' && feedback.options.sound != 'null') {
					var currentPlaying = self.getVariableValue('playing_sounds')

					return (currentPlaying != undefined && currentPlaying.includes(feedback.options.sound))
				}
				return false
			},
		},
		external_sound_playing: {
			name: 'External sound playing',
			type: 'advanced',
			options: [
				{
					id: 'showName',
					type: 'checkbox',
					label: 'Show the sound name',
					default: false
				},
				{
					id: 'image_warning',
					type: 'static-text',
					label: 'Fetch image from SmoredBoard',
					value: 'Needs an image placement in Style tab'
				},
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
			affectedProperties: ['png64', 'text'],
			callback: async (feedback) => {

				if (feedback.options.profile != 'null' && feedback.options.sound != "null") {
					var image = self.getSoundImage(feedback.options.sound)
					if (image == undefined) {
						self.sendPacket('GetSFXInfo', {
							ProfileGuid: feedback.options.profile,
							ProfileName: self.profilesData[feedback.options.profile]['ProfileName'],
							SoundName: self.getSoundName(feedback.options.sound, feedback.options.profile)
						})
					}
					var currentPlaying = self.getVariableValue('playing_sounds')
					var active = currentPlaying != undefined && currentPlaying.includes(feedback.options.sound)

					if (feedback.options.showName) {
						return active
							? { png64: undefined, text: self.getSoundName(feedback.options.sound, feedback.options.profile) } // TODO Add image var when imported
							: { png64: image, text: self.getSoundName(feedback.options.sound, feedback.options.profile) }
					} else {
						return active
							? { png64: undefined } // TODO Add image var when imported
							: { png64: image } // TODO Image border?
					}
				}
				return {}
			}, // TODO add reset stored image when unsubscribe
		},
	})
}
