import type ModuleInstance from './main.js'

export type FeedbacksSchema = {
	get_sound_id: {
		type: 'value'
		options: {
			profile: string,
			sound: string,
		}
	}
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
			activeAnimation: boolean,
			activeBgColor: number,
			imageWarning: boolean,
			profile: string,
			sound: string,

			animFrame: number, // Invisble, used for animation
			lastFrame: number,
		}
	}
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		get_sound_id: {
			name: 'Select a sound',
			description: 'Select a sound from a profile for button-wide selection in a local variable',
			type: 'value',
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
				},
			],
			callback: (feedback) => {
				return {
					profile: feedback.options.profile,
					sound: feedback.options.sound
				}
			},
		},
		custom_sound_playing: {
			name: 'Custom sound playing',
			description: 'Change style when the sound is playing',
			type: 'boolean',
			defaultStyle: {
				bgcolor: 0xfbb040,
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
					id: 'activeAnimation',
					type: 'checkbox',
					label: 'Currently playing animation',
					default: true
				},
				{
					id: 'activeBgColor',
					type: 'colorpicker',
					label: 'Background color',
					default: 0xfbb040
				},
				{
					id: 'imageWarning',
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
				},
				{
					id: 'animFrame',
					type: 'number',
					label: 'Animation frame',
					min: 1,
					max: 5,
					default: 1,
					isVisibleExpression: 'false'
				},
				{
					id: 'lastFrame',
					type: 'number',
					label: 'Time millis of last frame',
					min: 0,
					max: Number.MAX_SAFE_INTEGER,
					default: 0,
					isVisibleExpression: 'true'
				}
			],
			affectedProperties: ['png64', 'text', 'color', 'bgcolor'],
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

					if (feedback.options.activeAnimation && active) {
						// Need to do that because getVariableValue doesnt work with a dynamic argument
						switch (feedback.options.animFrame) {
							case 1:
								image = self.getVariableValue('img_playinganimation_sd_sound_playing_animation_1_base64')
								break
							case 2:
								image = self.getVariableValue('img_playinganimation_sd_sound_playing_animation_2_base64')
								break
							case 3:
								image = self.getVariableValue('img_playinganimation_sd_sound_playing_animation_3_base64')
								break
							case 4:
								image = self.getVariableValue('img_playinganimation_sd_sound_playing_animation_4_base64')
								break
							case 5:
								image = self.getVariableValue('img_playinganimation_sd_sound_playing_animation_5_base64')
								break
						}

						if (Date.now() - feedback.options.lastFrame >= 200) {
							if (feedback.options.animFrame < 5) {
								feedback.options.animFrame += 1
							} else {
								feedback.options.animFrame = 1
							}

							feedback.options.lastFrame = Date.now()
						}
						self.checkFeedbacksById(feedback.id)
					}

					return {
						png64: image,
						text: feedback.options.showName ? self.getSoundName(feedback.options.sound, feedback.options.profile) : undefined,
						color: active ? 0x000000 : undefined,
						bgcolor: active ? feedback.options.activeBgColor : undefined
					}
				}
				return {
					png64: self.getVariableValue('img_playinganimation_sd_sound_playing_animation_1_base64'),
					text: 'Select a sound'
				}
			},
			unsubscribe: async (feedback) => {
				if (feedback.options.profile != 'null' && feedback.options.sound != "null") {
					self.unsetSoundImage(feedback.options.sound)
				}
			}
		},
	})
}
