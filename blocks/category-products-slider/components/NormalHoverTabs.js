import { useState } from '@wordpress/element';
import { __ }       from '@wordpress/i18n';

const NormalHoverTabs = ({ normal, hover }) => {
	const [ tab, setTab ] = useState( 'normal' );

	const tabStyle = ( active ) => ({
		flex:            1,
		padding:         '4px 0',
		fontSize:        11,
		fontWeight:      600,
		textTransform:   'uppercase',
		letterSpacing:   '0.05em',
		cursor:          'pointer',
		border:          'none',
		borderBottom:    active ? '2px solid #cc2b5e' : '2px solid transparent',
		background:      'none',
		color:           active ? '#cc2b5e' : '#888',
		transition:      'color 0.15s, border-color 0.15s',
	});

	return (
		<div style={{ marginTop: 8, marginBottom: 4 }}>
			<div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: 10 }}>
				<button type="button" style={ tabStyle( tab === 'normal' ) } onClick={ () => setTab( 'normal' ) }>
					{ __( 'Normal', 'commerce-kit' ) }
				</button>
				<button type="button" style={ tabStyle( tab === 'hover' ) } onClick={ () => setTab( 'hover' ) }>
					{ __( 'Hover', 'commerce-kit' ) }
				</button>
			</div>
			{ tab === 'normal' ? normal : hover }
		</div>
	);
};

export default NormalHoverTabs;
