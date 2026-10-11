import { registerBlockType } from '@wordpress/blocks';
import { AlignmentControl, BlockControls, useBlockProps } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { currencyDollar } from '@wordpress/icons';
import clsx from 'clsx';
import useCourse from './shared/use-course';

function Edit( { attributes: { textAlign }, setAttributes, context } ) {
	const { course } = useCourse( context );
	const blockProps = useBlockProps( {
		className: clsx( { [ `has-text-align-${ textAlign }` ]: textAlign } ),
	} );

	return (
		<>
			<BlockControls group="block">
				<AlignmentControl
					value={ textAlign }
					onChange={ ( value ) => setAttributes( { textAlign: value } ) }
				/>
			</BlockControls>
			<div { ...blockProps }>
				{ course ? <RawHTML>{ course.price }</RawHTML> : <Spinner /> }
			</div>
		</>
	);
}

registerBlockType( 'academy/course-price', { edit: Edit, icon: currencyDollar } );
