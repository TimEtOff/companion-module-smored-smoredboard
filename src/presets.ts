import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'sounds',
			name: 'Sounds',
			description: 'Select the sound in the Local Variables tab',
			definitions: [
				'labeled_extern_sound',
				'extern_sound',
				'custom_sound',
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {} // TODO Change images variables to composite elements?
	presets['labeled_extern_sound'] = {
		type: 'layered',
		name: 'Labeled External Sound',
		localVariables: [
			{
				variableType: 'feedback',
				variableName: 'sound',
				feedbackId: 'get_sound_id',
				options: {
					profile: 'null',
					sound: 'null'
				}
			}
		],
		steps: [
			{
				down: [
					{
						actionId: 'add_sound',
						options: {
							profile: { isExpression: true, value: `$(local:sound)['profile']` },
							sound: { isExpression: true, value: `$(local:sound)['sound']` },
						}
					}
				],
				up: [],
			}
		],
		feedbacks: [
			{
				feedbackId: 'external_sound_playing',
				options: {
					showName: true,
					activeChangeImage: true,
					activeBgColor: 0xfbb040,
					image_warning: true,
					profile: { isExpression: true, value: `$(local:sound)['profile']` },
					sound: { isExpression: true, value: `$(local:sound)['sound']` },
				},
				styleOverrides: [
					{
						elementId: 'label',
						elementProperty: 'color',
						override: { isExpression: false, value: 'color' }
					},
					{
						elementId: 'label',
						elementProperty: 'text',
						override: { isExpression: false, value: 'text' }
					},
					{
						elementId: 'icon',
						elementProperty: 'base64Image',
						override: { isExpression: false, value: 'png64' }
					},
					{
						elementId: 'background',
						elementProperty: 'color',
						override: { isExpression: false, value: 'bgcolor' }
					}
				]
			}
		],
		elements: [
			{
				type: 'box',
				id: 'background',
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				color: 0x2b2c2c,
			},
			{
				type: 'image',
				id: 'icon',
				x: 20,
				y: 5,
				width: 60,
				height: 60,
				halign: 'center',
				valign: 'center',
				fillMode: 'fit',
				base64Image: ''
			},
			{
				type: 'text',
				id: 'label',
				x: 0,
				y: 67,
				width: 100,
				height: 30,
				color: 0xffffff,
				halign: 'center',
				valign: 'center',
				text: ''
			},
		]
	}

	presets['extern_sound'] = {
		type: 'layered',
		name: 'External Sound',
		localVariables: [
			{
				variableType: 'feedback',
				variableName: 'sound',
				feedbackId: 'get_sound_id',
				options: {
					profile: 'null',
					sound: 'null'
				}
			}
		],
		steps: [
			{
				down: [
					{
						actionId: 'add_sound',
						options: {
							profile: { isExpression: true, value: `$(local:sound)['profile']` },
							sound: { isExpression: true, value: `$(local:sound)['sound']` },
						}
					}
				],
				up: [],
			}
		],
		feedbacks: [
			{
				feedbackId: 'external_sound_playing',
				options: {
					showName: false,
					activeChangeImage: true,
					activeBgColor: 0xfbb040,
					image_warning: true,
					profile: { isExpression: true, value: `$(local:sound)['profile']` },
					sound: { isExpression: true, value: `$(local:sound)['sound']` },
				},
				styleOverrides: [
					{
						elementId: 'icon',
						elementProperty: 'base64Image',
						override: { isExpression: false, value: 'png64' }
					},
					{
						elementId: 'background',
						elementProperty: 'color',
						override: { isExpression: false, value: 'bgcolor' }
					}
				]
			}
		],
		elements: [
			{
				type: 'box',
				id: 'background',
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				color: 0x2b2c2c,
			},
			{
				type: 'image',
				id: 'icon',
				x: 5,
				y: 5,
				width: 90,
				height: 90,
				halign: 'center',
				valign: 'center',
				fillMode: 'fit',
				base64Image: ''
			},
		]
	}

	presets['custom_sound'] = {
		type: 'simple',
		name: 'Custom Sound',
		localVariables: [
			{
				variableType: 'feedback',
				variableName: 'sound',
				feedbackId: 'get_sound_id',
				options: {
					profile: 'null',
					sound: 'null'
				}
			}
		],
		steps: [
			{
				down: [
					{
						actionId: 'add_sound',
						options: {
							profile: { isExpression: true, value: `$(local:sound)['profile']` },
							sound: { isExpression: true, value: `$(local:sound)['sound']` },
						}
					}
				],
				up: [],
			}
		],
		feedbacks: [
			{
				feedbackId: 'custom_sound_playing',
				options: {
					profile: { isExpression: true, value: `$(local:sound)['profile']` },
					sound: { isExpression: true, value: `$(local:sound)['sound']` },
				},
				style: {
					bgcolor: 0xfbb040,
					color: 0x000000,
				}
			}
		],
		style: {
			bgcolor: 0x2b2c2c,
			color: 0xffffff,
			text: 'Sound name',
			size: 'auto'
		}
	}

	self.setPresetDefinitions(structure, presets)
}
