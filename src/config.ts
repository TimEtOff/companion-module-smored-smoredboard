import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	profileName: string
	token: string
	soundsFolder: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
			default: '127.0.0.1',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 8181,
		},
		{
			type: 'textinput',
			id: 'profileName',
			label: 'Profile name',
			description: 'If not set or not found, default to the first found profile',
			width: 256,
			default: undefined,
		},
		{
			type: 'textinput',
			id: 'token',
			label: 'Token',
			width: 256,
			default: 'SMORED1999VERYGOODANDCOOL',
		},
		{
			type: 'textinput',
			id: 'soundsFolder',
			label: 'Full path to sounds folder',
			description: 'In Smoredboard, right click on a sound > Open Sound File in Explorer > Copy the path to the folder, with ending separator',
			width: 32767,
			regex: '^.*[\\\/]$',
			default: undefined,
		},
	]
}
