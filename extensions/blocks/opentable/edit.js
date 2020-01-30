/**
 * External dependencies
 */
import 'url-polyfill';
import classnames from 'classnames';
import { isEmpty, isEqual, join } from 'lodash';

/**
 * WordPress dependencies
 */
import { BlockIcon, InspectorControls, InspectorAdvancedControls } from '@wordpress/block-editor';
import {
	ExternalLink,
	Notice,
	PanelBody,
	Placeholder,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import icon from './icon';
import { isAtomicSite, isSimpleSite } from '../../shared/site-type-utils';
import RestaurantPicker from './restaurant-picker';
import BlockStylesSelector from '../../shared/components/block-styles-selector';

import {
	getStyleOptions,
	getStyleValues,
	languageOptions,
	languageValues,
	defaultAttributes,
} from './attributes';
import { getValidatedAttributes } from '../../shared/get-validated-attributes';
import { getAttributesFromEmbedCode } from './utils';

export default function OpenTableEdit( { attributes, setAttributes, className, clientId } ) {
	const validatedAttributes = getValidatedAttributes( defaultAttributes, attributes );

	if ( ! isEqual( validatedAttributes, attributes ) ) {
		setAttributes( validatedAttributes );
	}

	const { align, rid, style, iframe, domain, lang, newtab } = attributes;
	const [ notice, setNotice ] = useState();

	const setErrorNotice = () =>
		setNotice(
			<>
				<strong>{ __( 'We ran into an issue', 'jetpack' ) }</strong>
				<br />
				{ __( 'Please ensure this embed matches the one from your OpenTable account', 'jetpack' ) }
			</>
		);

	const parseEmbedCode = embedCode => {
		const newAttributes = getAttributesFromEmbedCode( embedCode );
		if ( ! newAttributes ) {
			setErrorNotice();
		}

		const validatedNewAttributes = getValidatedAttributes( defaultAttributes, newAttributes );
		setAttributes( validatedNewAttributes );
	};

	const styleOptions = getStyleOptions( rid );
	const styleValues = getStyleValues( rid );

	const updateStyle = newStyle => {
		setAttributes( newStyle );
		// If the old style was wide
		// then reset the alignment
		if ( style === 'wide' && align === 'wide' ) {
			setAttributes( { align: '' } );
		}

		// If the new style is wide
		// then set the alignment to wide as it works much better like that
		if ( newStyle.style === 'wide' ) {
			setAttributes( { align: 'wide' } );
		}
	};

	const getTypeAndTheme = fromStyle =>
		rid.length > 1
			? [ 'multi', 'button' !== fromStyle ? fromStyle : 'standard' ]
			: [
					'button' === fromStyle ? 'button' : 'standard',
					'button' === fromStyle ? 'standard' : fromStyle,
			  ];

	const blockPreview = styleOveride => {
		const [ type, theme ] = getTypeAndTheme( styleOveride ? styleOveride : style );
		return (
			<>
				<div className={ `${ className }-overlay` }></div>
				<iframe
					title={ sprintf( __( 'Open Table Preview %s', 'jetpack' ), clientId ) }
					scrolling="no"
					src={ `https://www.opentable.com/widget/reservation/canvas?rid=${ join(
						rid,
						'%2C'
					) }&type=${ type }&theme=${ theme }&overlay=false&domain=${ domain }&lang=${
						lang && languageValues.includes( lang ) ? lang : 'en-US'
					}&newtab=${ newtab }&disablega=true` }
				/>
			</>
		);
	};

	const onPickerSubmit = input => {
		if ( Array.isArray( input ) ) {
			setAttributes( {
				rid: input,
				style: input.length > 1 && 'button' === style ? 'standard' : style,
			} );
		} else {
			parseEmbedCode( input );
		}
	};

	const inspectorControls = () => (
		<>
			<InspectorAdvancedControls>
				<ToggleControl
					label={ __( 'Load the widget in an iFrame (Recommended)', 'jetpack' ) }
					checked={ iframe }
					onChange={ () => setAttributes( { iframe: ! iframe } ) }
					className="is-opentable"
				/>
			</InspectorAdvancedControls>
			<InspectorControls>
				<PanelBody title={ __( 'Styles', 'jetpack' ) }>
					<BlockStylesSelector
						clientId={ clientId }
						styleOptions={ styleOptions }
						onSelectStyle={ updateStyle }
						activeStyle={ style }
						attributes={ attributes }
						viewportWidth={ 150 }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Settings', 'jetpack' ) }>
					<RestaurantPicker rids={ rid } onChange={ onPickerSubmit } />
					<SelectControl
						label={ __( 'Language', 'jetpack' ) }
						value={ lang }
						onChange={ newLang => setAttributes( { lang: newLang } ) }
						options={ languageOptions }
					/>
					<ToggleControl
						label={ __( 'Open in a new window', 'jetpack' ) }
						checked={ newtab }
						onChange={ () => setAttributes( { newtab: ! newtab } ) }
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);

	const supportLink =
		isSimpleSite() || isAtomicSite()
			? 'https://en.support.wordpress.com/wordpress-editor/blocks/opentable-block/'
			: 'https://jetpack.com/support/jetpack-blocks/opentable-block/';

	const blockPlaceholder = (
		<Placeholder
			label={ __( 'OpenTable Reservation', 'jetpack' ) }
			icon={ <BlockIcon icon={ icon } /> }
			instructions={ __(
				'Enter your restaurant name, or paste an OpenTable Reservation Widget embed code.',
				'jetpack'
			) }
			notices={
				notice && (
					<Notice status="error" isDismissible={ false }>
						{ notice }
					</Notice>
				)
			}
		>
			<RestaurantPicker rids={ rid } onSubmit={ onPickerSubmit } />
			<div className={ `${ className }-placeholder-links` }>
				<ExternalLink href="https://restaurant.opentable.com/get-started/">
					{ __( 'Sign up for OpenTable', 'jetpack' ) }
				</ExternalLink>
				<ExternalLink href={ supportLink }>{ __( 'Learn more', 'jetpack' ) }</ExternalLink>
			</div>
		</Placeholder>
	);

	const editClasses = classnames( className, {
		[ `${ className }-theme-${ style }` ]: ! isEmpty( rid ) && styleValues.includes( style ),
		'is-multi': 'multi' === getTypeAndTheme( style )[ 0 ],
		[ `align${ align }` ]: align,
	} );

	return (
		<div className={ editClasses }>
			{ ! isEmpty( rid ) && <>{ inspectorControls() }</> }
			{ ! isEmpty( rid ) ? blockPreview() : blockPlaceholder }
		</div>
	);
}
