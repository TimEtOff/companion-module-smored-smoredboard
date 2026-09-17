import type ModuleInstance from './main.js'

export type VariablesSchema = {
	playing_sounds: string[]
}

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions({
		playing_sounds: { name: 'Sounds paths currently playing' },
	})
}
