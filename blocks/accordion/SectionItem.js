import { RichText } from '@wordpress/block-editor';
import { Button }   from '@wordpress/components';
import { __ }       from '@wordpress/i18n';

const SectionItem = ({ section, index, onToggle, onUpdate, onRemove, isLast, attributes }) => {
	const {
		borderColor, borderSize, borderStyle,
		titleColor, titleFontSize, titleFontFamily,
		contentColor, contentFontSize, contentFontFamily,
	} = attributes;

	return (
		<div
			className="px-4 border border-[#0029af] rounded-sm mb-4 p-3 accordion-section"
			style={{ borderColor, borderWidth: borderSize, borderStyle }}
		>
			<div
				onClick={() => onToggle(index)}
				className="commerce-kit-accordion-header cursor-pointer py-2 mb-2 flex items-center"
			>
				<RichText
					tagName="h3"
					value={section.title}
					onChange={(val) => onUpdate(index, 'title', val)}
					placeholder={__('Enter title...', 'commerce-kit')}
					style={{ color: titleColor, fontSize: titleFontSize, fontFamily: titleFontFamily }}
				/>
				<span className="accordion-icon text-[#0029af] font-bold">
					{section.isOpen ? '-' : '+'}
				</span>
			</div>

			{section.isOpen && (
				<div className="accordion-content">
					<RichText
						tagName="div"
						value={section.content}
						onChange={(val) => onUpdate(index, 'content', val)}
						placeholder={__('Enter content...', 'commerce-kit')}
						className="text-gray-800 p-2 rounded bg-white"
						style={{ color: contentColor, fontSize: contentFontSize, fontFamily: contentFontFamily }}
					/>
				</div>
			)}

			<Button
				isDestructive
				onClick={() => onRemove(index)}
				className="mt-2"
				disabled={isLast}
			>
				{__('Remove Section', 'commerce-kit')}
			</Button>
		</div>
	);
};

export default SectionItem;
