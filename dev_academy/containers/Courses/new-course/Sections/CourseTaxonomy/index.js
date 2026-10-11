import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import Categories from '@Components/Term/Categories';
import Tags from '@Components/Term/Tags';
import Excerpt from './Excerpt';
import EcmPromo from '@Components/EcmPromo';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInCludedTags } from '@Redux/Slices/tagSlice/tagSlice';
import { applyFilters } from '@wordpress/hooks';
import { ecm_is_active } from '@Utils/helper';
import useEcmFilterReady from '@Utils/hooks/useEcmFilterReady';
import Preloader from '@Components/Loader/Preloader';

import './styles.scss';

const TAXONOMY_HOOK = 'ecm.react-editor.register-taxonomy';

const CourseTaxonomy = () => {
	const { values, setFieldValue } = useFormikContext();
	const { data: tagData } = useSelector((state) => state.tags);
	const settings = useSelector((state) => state.settings);
	const [missingTags, setMissingTags] = useState(false);
	const dispatch = useDispatch();
	const ecmReady = useEcmFilterReady(TAXONOMY_HOOK);

	useEffect(() => {
		if (values?.academy_courses_tag?.length && tagData?.length) {
			setMissingTags(
				values?.academy_courses_tag?.filter(
					(tagItem) =>
						!tagData.some(
							(item) => parseInt(item?.id) === parseInt(tagItem)
						)
				) || []
			);
		}
	}, [tagData]);

	useEffect(() => {
		const fetchMissingTags = async () => {
			if (missingTags.length) {
				await dispatch(fetchInCludedTags(missingTags));
				setMissingTags(false);
			}
		};

		fetchMissingTags();
	}, [missingTags?.length]);

	return (
		<div className="academy-inner academy-widget--taxonomy">
			<span className="academy-heading academy-widget--taxonomy__heading">
				{__('Course Taxonomy', 'academy')}
			</span>
			<div className="academy-widget--taxonomy__grid">
				<Categories
					label={__('Course Category', 'academy')}
					values={values.academy_courses_category}
					saveValueHandler={setFieldValue}
					type="course"
				/>
				<Tags
					label={__('Course Tags', 'academy')}
					values={values?.academy_courses_tag}
					saveValueHandler={setFieldValue}
					type="course"
				/>
				<Excerpt />
			</div>

			{/* Custom taxonomy — a variable number of extra taxonomies
			ECM registers; own full-width row below Category/Tags/
			Excerpt, laid out in its own sub-grid (see styles.scss) so it
			doesn't depend on how many ECM adds. When the ECM plugin
			isn't active at all, its filter never registers (the slot
			would render empty), so promote it instead. */}
			{ecm_is_active ? (
				<div className="academy-widget--taxonomy__ecm">
					{ecmReady ? (
						applyFilters(
							TAXONOMY_HOOK,
							null,
							values,
							setFieldValue,
							'academy_courses'
						)
					) : (
						<Preloader size="sm" />
					)}
				</div>
			) : (
				<EcmPromo label={__('courses', 'academy')} />
			)}
		</div>
	);
};

export default CourseTaxonomy;
