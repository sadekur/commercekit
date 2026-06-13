import { Spinner } from '@wordpress/components';
import { __ }     from '@wordpress/i18n';

const Preview = ({ attributes, categories, isLoading, fetchError }) => {
	const {
		layout, colDesktop, spaceBetween,
		showSectionTitle, sectionTitleText,
		showThumbnail, thumbnailShape, thumbnailRadius,
		showThumbBorder, thumbBorderWidth, thumbBorderStyle, thumbBorderColor,
		showBoxShadow, boxShadowH, boxShadowV, boxShadowBlur, boxShadowSpread, boxShadowColor,
		thumbInnerPad, thumbMarginBottom, imageMode,
		contentPadTop, contentPadRight, contentPadBottom, contentPadLeft,
		showCatName, catNameFontSize, catNameFontWeight, catNameColor, catNameMarginTop,
		showProductCount, productCountPos, productCountBefore, productCountAfter,
		countFontSize, countColor,
		showCustomText, customText,
		showDescription, descFontSize, descColor, descMarginTop,
		showShopNow, shopNowLabel, shopNowBgColor, shopNowTextColor,
		shopNowBorderRadius, shopNowAlignment, shopNowMarginTop,
	} = attributes;

	const previewCount = layout === 'slider'
		? 1
		: Math.min(colDesktop || 3, 4);
	const previewCats  = categories.slice(0, previewCount);

	const thumbBr = thumbnailShape === 'circle'  ? '50%'
	              : thumbnailShape === 'rounded' ? '8px'
	              : thumbnailRadius > 0           ? thumbnailRadius + 'px'
	              : '0';

	return (
		<div className="ck-csl-editor-preview">

			{showSectionTitle && sectionTitleText && (
				<h3 className="ck-csl-editor-title">{sectionTitleText}</h3>
			)}

			{isLoading && (
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#888' }}>
					<Spinner />
					<span style={{ fontSize: 13 }}>{__('Loading categories…', 'commerce-kit')}</span>
				</div>
			)}

			{!isLoading && fetchError && (
				<div style={{ padding: '12px 16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, fontSize: 13, color: '#856404' }}>
					{__('Could not load categories. Make sure WooCommerce is active and you are logged in as an administrator.', 'commerce-kit')}
				</div>
			)}

			{!isLoading && !fetchError && categories.length === 0 && (
				<div style={{ padding: '12px 16px', background: '#f0f0f0', borderRadius: 4, fontSize: 13, color: '#555' }}>
					{__('No categories found with the current settings.', 'commerce-kit')}
				</div>
			)}

			{!isLoading && !fetchError && previewCats.length > 0 && (
				<div
					className="ck-csl-editor-cards"
					style={{ display: 'flex', gap: spaceBetween + 'px', overflow: 'hidden', alignItems: 'stretch' }}
				>
					{previewCats.map((cat) => {
						const thumbSrc  = cat.image && cat.image.src ? cat.image.src : null;
						const thumbAlt  = cat.image && cat.image.alt ? cat.image.alt : cat.name;
						const cardWidth = `calc(${100 / previewCount}% - ${spaceBetween * (previewCount - 1) / previewCount}px)`;
						const desc      = cat.description ? cat.description.replace(/<[^>]+>/g, '') : '';

						return (
							<div
								key={cat.id}
								className="ck-csl-editor-card"
								style={{ flex: `0 0 ${cardWidth}`, minWidth: 0, display: 'flex', flexDirection: 'column' }}
							>
								{showThumbnail && (
									<div style={{
										overflow: 'hidden',
										borderRadius: thumbBr,
										border: showThumbBorder ? `${thumbBorderWidth}px ${thumbBorderStyle} ${thumbBorderColor}` : 'none',
										boxShadow: showBoxShadow ? `${boxShadowH}px ${boxShadowV}px ${boxShadowBlur}px ${boxShadowSpread}px ${boxShadowColor}` : 'none',
										padding: thumbInnerPad ? thumbInnerPad + 'px' : 0,
										marginBottom: thumbMarginBottom ? thumbMarginBottom + 'px' : 0,
										background: '#f0f0f0',
										lineHeight: 0,
										filter: imageMode === 'grayscale' ? 'grayscale(100%)' : 'none',
									}}>
										{thumbSrc ? (
											<img
												src={thumbSrc}
												alt={thumbAlt}
												style={{ width: '100%', height: 'auto', display: 'block', borderRadius: thumbBr }}
											/>
										) : (
											<div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>
												<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
													<rect x="3" y="3" width="18" height="18" rx="2"/>
													<circle cx="8.5" cy="8.5" r="1.5"/>
													<polyline points="21 15 16 10 5 21"/>
												</svg>
											</div>
										)}
									</div>
								)}

								<div style={{ flex: 1, padding: `${contentPadTop}px ${contentPadRight}px ${contentPadBottom}px ${contentPadLeft}px` }}>
									{showCatName && (
										<div style={{ fontWeight: catNameFontWeight, fontSize: catNameFontSize, color: catNameColor, marginTop: catNameMarginTop, lineHeight: 1.3 }}>
											{cat.name}
											{showProductCount && productCountPos === 'beside' && (
												<span style={{ fontSize: countFontSize, color: countColor, marginLeft: 4 }}>
													{productCountBefore}{cat.count}{productCountAfter}
												</span>
											)}
										</div>
									)}

									{showProductCount && productCountPos === 'under' && (
										<div style={{ fontSize: countFontSize, color: countColor, marginTop: 4 }}>
											{productCountBefore}{cat.count}{productCountAfter}
										</div>
									)}

									{showCustomText && customText && (
										<div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{customText}</div>
									)}

									{showDescription && (
										<div style={{ fontSize: descFontSize, color: descColor, marginTop: descMarginTop, lineHeight: 1.5 }}>
											{desc || <em style={{ color: '#bbb' }}>{__('(no description)', 'commerce-kit')}</em>}
										</div>
									)}

									{showShopNow && (
										<div style={{ textAlign: shopNowAlignment, marginTop: shopNowMarginTop }}>
											<span style={{
												display: 'inline-block', padding: '8px 18px',
												background: shopNowBgColor, color: shopNowTextColor,
												borderRadius: shopNowBorderRadius, fontSize: 13, fontWeight: 600, cursor: 'default',
											}}>
												{shopNowLabel}
											</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			<div className="ck-csl-editor-hint">
				{categories.length > previewCount
					? `${__('Showing', 'commerce-kit')} ${previewCount} ${__('of', 'commerce-kit')} ${categories.length} ${__('categories. Full carousel renders on the front-end.', 'commerce-kit')}`
					: __('Front-end renders the full Swiper carousel with all configured settings.', 'commerce-kit')
				}
			</div>
		</div>
	);
};

export default Preview;
