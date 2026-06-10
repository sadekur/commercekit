import { Flex, FlexItem, __experimentalNumberControl as NumberControl } from '@wordpress/components';

const SIDES = [['T', 'topKey'], ['R', 'rightKey'], ['B', 'bottomKey'], ['L', 'leftKey']];

const SpacingRow = ({ label, topKey, rightKey, bottomKey, leftKey, attributes, setAttributes }) => {
	const keys = { topKey, rightKey, bottomKey, leftKey };
	return (
		<div>
			<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 6 }}>{label}</div>
			<Flex>
				{SIDES.map(([abbr, prop]) => (
					<FlexItem key={prop}>
						<div style={{ textAlign: 'center', fontSize: '10px', color: '#888', marginBottom: 2 }}>{abbr}</div>
						<NumberControl
							value={attributes[keys[prop]]}
							min={0}
							max={200}
							onChange={(v) => setAttributes({ [keys[prop]]: parseInt(v) || 0 })}
							style={{ width: 56 }}
						/>
					</FlexItem>
				))}
			</Flex>
		</div>
	);
};

export default SpacingRow;
