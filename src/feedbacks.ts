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
			activeChangeImage: boolean,
			activeBgColor: number,
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
			description: 'Change style when the sound is playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0xfbb040,
				color: 0xffffff,
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
			description: 'Change style to the one in SmoredBoard',
			type: 'advanced',
			options: [
				{
					id: 'showName',
					type: 'checkbox',
					label: 'Show the sound name',
					default: true
				},
				{
					id: 'activeChangeImage',
					type: 'checkbox',
					label: 'Currently playing image',
					default: true
				},
				{
					id: 'activeBgColor',
					type: 'colorpicker',
					label: 'Background color',
					default: 0xfbb040
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
			affectedProperties: ['png64', 'text', 'bgcolor'],
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

					if (feedback.options.activeChangeImage && active) {
						image = undefined // TODO Add image var when imported
					}

					return {
						png64: image,
						text: feedback.options.showName ? self.getSoundName(feedback.options.sound, feedback.options.profile) : undefined,
						bgcolor: active ? feedback.options.activeBgColor : undefined
					}
				}
				return {}
			},
			unsubscribe: async (feedback) => {
				if (feedback.options.profile != 'null' && feedback.options.sound != "null") {
					self.unsetSoundImage(feedback.options.sound)
				}
			}
		},
	})
}
