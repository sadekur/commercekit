import { useState }                       from '@wordpress/element';
import { PanelRow, ColorPicker, Popover } from '@wordpress/components';

const ColorRow = ({ label, value, onChange }) => {
	const [isOpen, setIsOpen] = useState( false );

	// ColorPicker onChange passes a hex string in WP 6.x+; an object with .hex in older versions.
	const handleChange = ( color ) =>
		onChange( typeof color === 'string' ? color : ( color.hex || color ) );

	return (
		<PanelRow>
			<label style={{ fontSize: '12px', color: '#1e1e1e' }}>{ label }</label>
			<div style={{ position: 'relative' }}>
				<button
					type="button"
					onClick={ () => setIsOpen( ( o ) => ! o ) }
					style={{
						width:           36,
						height:          28,
						padding:         0,
						border:          '1px solid #ccc',
						borderRadius:    3,
						cursor:          'pointer',
						backgroundColor: value || '#000000',
						display:         'block',
					}}
					aria-label={ label }
				/>
				{ isOpen && (
					<Popover
						placement="left-start"
						onClose={ () => setIsOpen( false ) }
						focusOnMount={ false }
					>
						<div style={{ padding: '8px 8px 0' }}>
							<ColorPicker
								color={ value }
								onChange={ handleChange }
								enableAlpha={ false }
								copyFormat="hex"
							/>
						</div>
					</Popover>
				) }
			</div>
		</PanelRow>
	);
};

export default ColorRow;
