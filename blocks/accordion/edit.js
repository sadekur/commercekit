import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import StylePanel  from './panels/StylePanel';
import SectionItem from './SectionItem';

const Edit = ({ attributes, setAttributes }) => {
	const blockProps = useBlockProps();

	const updateSections = (sections) => setAttributes({ sections });

	const toggleSection = (index) =>
		updateSections(attributes.sections.map((s, i) =>
			i === index ? { ...s, isOpen: !s.isOpen } : s
		));

	const updateSection = (index, field, value) =>
		updateSections(attributes.sections.map((s, i) =>
			i === index ? { ...s, [field]: value } : s
		));

	const addSection = () =>
		updateSections([...attributes.sections, { title: 'New Accordion', content: '', isOpen: false }]);

	const removeSection = (index) => {
		if (attributes.sections.length > 1) {
			updateSections(attributes.sections.filter((_, i) => i !== index));
		} else {
			alert(__('You cannot remove the last section.', 'commerce-kit'));
		}
	};

	return (
		<div {...blockProps}>
			<InspectorControls>
				<StylePanel attributes={attributes} setAttributes={setAttributes} />
			</InspectorControls>

			{attributes.sections.map((section, index) => (
				<SectionItem
					key={index}
					section={section}
					index={index}
					onToggle={toggleSection}
					onUpdate={updateSection}
					onRemove={removeSection}
					isLast={attributes.sections.length === 1}
					attributes={attributes}
				/>
			))}

			<button
				onClick={addSection}
				className="commerce-kit-add-section mt-4 p-2"
				style={{
					backgroundColor: attributes.buttonBackgroundColor,
					color:           attributes.buttonTextColor,
					fontSize:        attributes.buttonFontSize,
					fontFamily:      attributes.buttonFontFamily,
					borderColor:     attributes.buttonColor,
					borderWidth:     '1px',
					borderStyle:     'solid',
				}}
			>
				{attributes.buttonText}
			</button>
		</div>
	);
};

export default Edit;
