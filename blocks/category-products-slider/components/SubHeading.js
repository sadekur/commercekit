const SubHeading = ({ children }) => (
	<div style={{
		fontSize: '11px',
		fontWeight: 700,
		textTransform: 'uppercase',
		letterSpacing: '0.06em',
		color: '#3c3c3c',
		borderLeft: '3px solid #cc2b5e',
		background: 'linear-gradient(90deg,#fdf0f3 0%,transparent 80%)',
		padding: '5px 8px',
		borderRadius: '0 2px 2px 0',
		marginTop: '20px',
		marginBottom: '10px',
	}}>
		{children}
	</div>
);

export default SubHeading;
