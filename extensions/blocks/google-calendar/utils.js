/**
 * Internal dependencies
 */
import { URL_REGEX, IFRAME_REGEX } from '.';

const ATTRIBUTE_REGEX = /\s+(\w+)=(["'])(.*?)\2/gi;

/**
 * Given an <iframe> that matches IFRAME_REGEX, extract the url, width, and height.
 *
 * @param {string} html The HTML to extract from.
 * @returns {Object} An object containing the url, width, and height.
 */
export function extractAttributesFromIframe( html ) {
	const data = IFRAME_REGEX.exec( html );
	const attributes = {};

	data.forEach( ( match, index ) => {
		if ( 0 === index ) {
			return;
		}

		if ( URL_REGEX.test( match ) ) {
			attributes.url = match;
			return;
		}

		let attr_match;
		while ( ( attr_match = ATTRIBUTE_REGEX.exec( match ) ) !== null ) {
			attributes[ attr_match[ 1 ] ] = attr_match[ 3 ];
		}
	} );

	return {
		url: attributes.url,
		width: attributes.width,
		height: attributes.height,
	};
}
