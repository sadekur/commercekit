const SubHeading = ({ children }) => (
	<div style={{
		fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
		letterSpacing: '0.08em', color: '#1e1e1e',
		borderBottom: '1px solid #e0e0e0', paddingBottom: '6px',
		marginBottom: '12px', marginTop: '16px',
	}}>
		{children}
	</div>
);

export default SubHeading;
