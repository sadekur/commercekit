import { PanelRow } from '@wordpress/components';

const ColorRow = ({ label, value, onChange }) => (
	<PanelRow>
		<label style={{ fontSize: '12px', color: '#1e1e1e' }}>{label}</label>
		<input
			type="color"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			style={{ width: 36, height: 28, padding: 2, border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer' }}
		/>
	</PanelRow>
);

export default ColorRow;
