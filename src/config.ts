import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
	token: string
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
			id: 'token',
			label: 'Token',
			width: 256,
			default: 'SMORED1999VERYGOODANDCOOL',
		},
	]
}
