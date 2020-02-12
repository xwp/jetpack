/**
 * External dependencies
 */
import tinycolor from 'tinycolor2';
import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies
 */
import {
	BlockIcon,
	ContrastChecker,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	Button,
	FormTokenField,
	Notice,
	PanelBody,
	Placeholder,
	ToggleControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import icon from './icon';
import data from './dummy-data';
import './editor.scss';

export default function AmazonEdit( {
	attributes: {
		backgroundColor,
		textColor,
		buttonAndLinkColor,
		asin,
		showImage,
		showTitle,
		showSeller,
		showPrice,
		showPurchaseButton,
	},
	className,
	setAttributes,
} ) {
	const notice = false; // TODO

	const [ suggestions, setSuggestions ] = useState( [] );
	const onInputChange = () => {
		// TODO get suggestions from API
		// It would be great if we didn't have to embed the ASIN like this but I think that
		// requires changes to core
		setSuggestions(
			data.products.map( dataProduct => `${ dataProduct.title } (ASIN:${ dataProduct.asin })` )
		);
	};

	const idRegex = /^(\d+)$|\(ASIN:(.+)\)$/;
	const onChange = selectedProducts => {
		const selectedIds = selectedProducts.map( selectedProduct => {
			const parsed = idRegex.exec( selectedProduct );
			const selectedId = parsed[ 1 ] || parsed[ 2 ];
			return data.products.filter( filteredProduct => filteredProduct.asin === selectedId );
		} );
		setAttributes( { asin: selectedIds[ 0 ][ 0 ].asin } );
	};

	const blockPlaceholder = (
		<Placeholder
			label={ __( 'Amazon', 'jetpack' ) }
			instructions={ __( 'Search by entering an Amazon product name or ID below.', 'jetpack' ) }
			icon={ <BlockIcon icon={ icon } /> }
			notices={
				notice && (
					<Notice status="error" isDismissible={ false }>
						{ notice }
					</Notice>
				)
			}
		>
			<form>
				<FormTokenField
					value={ asin }
					suggestions={ suggestions }
					onInputChange={ onInputChange }
					maxSuggestions={ 10 }
					label={ __( 'Products', 'jetpack' ) }
					onChange={ onChange }
				/>
				<Button isSecondary isLarge type="submit">
					{ __( 'Preview', 'jetpack' ) }
				</Button>
			</form>
		</Placeholder>
	);

	const inspectorControls = (
		<InspectorControls>
			{ asin && (
				<>
					<PanelBody title={ __( 'Promotion Settings', 'jetpack' ) }>
						<ToggleControl
							label={ __( 'Show Image', 'jetpack' ) }
							checked={ showImage }
							onChange={ () => setAttributes( { showImage: ! showImage } ) }
						/>
						<ToggleControl
							label={ __( 'Show Title', 'jetpack' ) }
							checked={ showTitle }
							onChange={ () => setAttributes( { showTitle: ! showTitle } ) }
						/>
						<ToggleControl
							label={ __( 'Show Author/Seller', 'jetpack' ) }
							checked={ showSeller }
							onChange={ () => setAttributes( { showSeller: ! showSeller } ) }
						/>
						<ToggleControl
							label={ __( 'Show Price', 'jetpack' ) }
							checked={ showPrice }
							onChange={ () => setAttributes( { showPrice: ! showPrice } ) }
						/>
						<ToggleControl
							label={ __( 'Show Purchase Button', 'jetpack' ) }
							checked={ showPurchaseButton }
							onChange={ () => setAttributes( { showPurchaseButton: ! showPurchaseButton } ) }
						/>
					</PanelBody>
					<PanelColorSettings
						title={ __( 'Color Settings', 'jetpack' ) }
						colorSettings={ [
							{
								value: backgroundColor,
								onChange: newBackgroundColor =>
									setAttributes( { backgroundColor: newBackgroundColor } ),
								label: __( 'Background Color', 'jetpack' ),
							},
							{
								value: textColor,
								onChange: newTextColor => setAttributes( { textColor: newTextColor } ),
								label: __( 'Text Color', 'jetpack' ),
							},
							{
								value: buttonAndLinkColor,
								onChange: newButtonAndLinkColor =>
									setAttributes( { buttonAndLinkColor: newButtonAndLinkColor } ),
								label: __( 'Button & Link Color', 'jetpack' ),
							},
						] }
					>
						{
							<ContrastChecker
								{ ...{
									isLargeText: false,
									textColor: textColor,
									backgroundColor: backgroundColor,
								} }
							/>
						}
					</PanelColorSettings>
				</>
			) }
		</InspectorControls>
	);

	const blockPreview = () => {
		const {
			title,
			detailPageUrl,
			listPrice,
			imageUrlMedium,
			imageWidthMedium,
			imageHeightMedium,
		} = data.products.filter( productDataItem => productDataItem.asin === asin )[ 0 ];

		// TODO - we should be able to get this from API in a neater way once we have access
		const seller = 'TODO';

		// TODO - we have different image sizes in the API
		const image = imageUrlMedium && (
			<a href={ detailPageUrl }>
				<img
					alt={ title }
					src={ imageUrlMedium }
					width={ imageWidthMedium }
					heigth={ imageHeightMedium }
				/>
			</a>
		);

		const buttonTextColor = tinycolor
			.mostReadable( buttonAndLinkColor, [ '#ffffff' ], {
				includeFallbackColors: true,
				size: 'small',
			} )
			.toHexString();

		if ( ! asin ) {
			return null;
		}

		return (
			<div
				style={ { backgroundColor: backgroundColor, color: textColor, width: imageWidthMedium } }
			>
				{ showImage && image }
				{ showTitle && (
					<div className={ `${ className }-title` }>
						<a href={ detailPageUrl } style={ { color: buttonAndLinkColor } }>
							{ title }
						</a>
					</div>
				) }
				{ showSeller && seller && (
					<div className={ `${ className }-seller` }>
						{ seller.length > 0 && typeof seller !== 'string'
							? seller.map( singleSeller => singleSeller )
							: seller }
					</div>
				) }
				{ showPrice && <div className={ `${ className }-list-price` }>{ listPrice }</div> }
				{ showPurchaseButton && (
					<Button
						href={ detailPageUrl }
						icon={ icon }
						isPrimary
						className={ `${ className }-button` }
						style={ {
							color: buttonTextColor,
							backgroundColor: buttonAndLinkColor,
							borderColor: buttonAndLinkColor,
						} }
					>
						{ __( 'Shop Now', 'jetpack' ) }
					</Button>
				) }
			</div>
		);
	};

	return (
		<div className={ className }>
			{ inspectorControls }
			{ asin ? blockPreview() : blockPlaceholder }
		</div>
	);
}
