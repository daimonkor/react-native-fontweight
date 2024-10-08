import {Platform, StyleSheet, Text} from 'react-native'
import React from 'react'

type FontStyle = 'normal' | 'italic' | 'oblique'
type FontWeight =
	| 'normal'
	| 'bold'
	| 'bolder'
	| 'lighter'
	| '100'
	| '200'
	| '300'
	| '400'
	| '500'
	| '600'
	| '700'
	| '800'
	| '900'

// FIXME: This function is hideous
function double_pascal_case_to_two_words(str: string) {
	let index
	let count = 0
	for (let i = 0; i < str.length; i++) {
		let ch = str.charAt(i)
		if (ch >= 'A' && ch <= 'Z') {
			count++
		}
		if (count === 2 && !index) {
			index = i
		}
	}
	if (count === 2) {
		return str.substr(0, index) + ' ' + str.substring(index, str.length)
	} else {
		return str
	}
}

function font_style_generator(
	font_family: string,
	font_weight: FontWeight,
	font_style: FontStyle,
): {fontFamily?: string; fontWeight: string} {
	let fontFamily = `${font_family}-`

	switch (font_weight) {
		case 'normal':
			fontFamily += 'Regular'
			break
		case 'bold':
			fontFamily += 'Bold'
			break
		case '100':
			fontFamily += 'Thin'
			break
		case '200':
			fontFamily += 'Ultralight'
			break
		case '300':
			fontFamily += 'Light'
			break
		case '400':
			fontFamily += 'Regular'
			break
		case '500':
			fontFamily += 'Medium'
			break
		case '600':
			fontFamily += 'Semibold'
			break
		case '700':
			fontFamily += 'Bold'
			break
		case '800':
			fontFamily += 'Heavy'
			break
		case '900':
			fontFamily += 'Black'
			break
		case 'bolder':
		case 'lighter':
		// @ts-ignore
		case 'default':
			fontFamily += 'Regular'
			break
	}

	if (font_style === 'italic') {
		fontFamily += 'Italic'
	}

	return  { ...font_family && {fontFamily: fontFamily}, fontWeight: 'normal' };
}

const oldRender = (Text as any).render

class FontManager {
	customFonts: string [] = []

	init = (...customFonts: string[]) => {
		(Text as any).render = this.override
		this.customFonts = customFonts
	}

	override = (...args) => {
		/* FIXME: Determine if this was the correct thing to do
     *   Original code  ->  const origin = oldRender.call(this, ...args);
     *   Used to contain error 'the containing arrow function captures the global'
     *   Therefore swapped it to function instead of arrow to remove global scope
     */
		const origin = oldRender.call(this, ...args)

		if (Platform.OS === 'android') {
			if (origin.props.style) {
				const style = StyleSheet.flatten([origin.props.style])

				if(!this.customFonts?.includes(style.fontFamily)){
					return origin
				}

				const fontWeight: FontWeight = style.fontWeight ? style.fontWeight : '400'

				const fontStyle: FontStyle = style.fontStyle ? style.fontStyle : 'normal'
				// HACK: Disabled mutation of fontStyle as is immutable in some libaries
				// origin.props.style.fontStyle = 'normal'

				const fontFamily: string = style.fontFamily

				return React.cloneElement(origin, {
					style: [{}, style, font_style_generator(fontFamily, fontWeight, fontStyle)],
				})
			}
			return origin
		} else {
			if (origin.props.style) {
				const style = StyleSheet.flatten([origin.props.style])
				if (style.fontFamily && this.customFonts?.includes(style.fontFamily)) {
					const fontFamily: string = style.fontFamily
					style.fontFamily = double_pascal_case_to_two_words(fontFamily)
					origin.props.style = style
				}
			}
			return origin
		}
	}
}
export default new FontManager()
