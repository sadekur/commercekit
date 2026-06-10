import { TextControl } from '@wordpress/components';

const ColorControl = ({ label, value, onChange }) => (
	<TextControl label={label} value={value} type="color" onChange={onChange} />
);

export default ColorControl;
