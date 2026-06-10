import { Flex, FlexItem, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const BREAKPOINTS = [
	['colLarge',   '≥1280px', 'Large Desktop'],
	['colDesktop', '≥1024px', 'Desktop'],
	['colLaptop',  '≥768px',  'Laptop'],
	['colTablet',  '≥480px',  'Tablet'],
	['colMobile',  '<480px',  'Mobile'],
];

const ResponsiveColumns = ({ attributes, setAttributes }) => (
	<div>
		<div style={{ fontSize: '12px', color: '#1e1e1e', marginBottom: 8 }}>
			{__('Columns per breakpoint', 'commerce-kit')}
		</div>
		<Flex wrap>
			{BREAKPOINTS.map(([key, bp, label]) => (
				<FlexItem key={key}>
					<div style={{ textAlign: 'center', fontSize: '10px', color: '#888', marginBottom: 2 }}>{bp}</div>
					<NumberControl
						value={attributes[key]}
						min={1}
						max={10}
						onChange={(v) => setAttributes({ [key]: Math.max(1, parseInt(v) || 1) })}
						style={{ width: 52 }}
						title={__(label, 'commerce-kit')}
					/>
				</FlexItem>
			))}
		</Flex>
	</div>
);

export default ResponsiveColumns;
