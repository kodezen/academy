import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';
import AcademySelect from '@Components/AcademySelect';
import { __, sprintf } from '@wordpress/i18n';
import { makeRequest } from '@Utils/helper';
import debounce from 'just-debounce-it';

import './styles.scss';

const propTypes = {
	name: PropTypes.string,
	postType: PropTypes.string,
	productType: PropTypes.string,
	title: PropTypes.string,
	action: PropTypes.string,
	placeholder: PropTypes.string,
	subtitle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
	desc: PropTypes.string,
	isMulti: PropTypes.bool,
	isClearable: PropTypes.bool,
};

export default function PostSelect({
	name,
	postType = '',
	productType = '',
	title = '',
	action = 'academy/fetch_posts',
	placeholder = '',
	subtitle = '',
	desc = '',
	isMulti = false,
	isClearable = true,
	position = 'bottom',
	whiteSpace = '',
	suffix = "post-select"
}) {
	const { values, setFieldValue } = useFormikContext();
	const nameObj = name.split('.');
	const value = nameObj[1]
		? values[nameObj[0]][nameObj[1]]
		: values[nameObj[0]];
	const [isFetch, setIsFetch] = useState(false);
	const [options, setOptions] = useState([]);

	useEffect(() => {
		if (!isMulti && parseInt(value)) {
			setIsFetch(true);
			makeRequest({
				action,
				postType,
				postId: parseInt(value),
			}).then((response) => {
				if (name === 'meta.academy_prerequisite_courses') {
					setIsFetch(false);
					setOptions(
						response?.data?.data.filter(
							(item) =>
								parseInt(item.value) !==
								parseInt(values.post_ID)
						)
					);
				} else {
					setIsFetch(false);
					setOptions(response?.data?.data);
				}
			});
		}
	}, [value]);

	const fetchDataHandler = (keyword = '') => {
		setIsFetch(true);
		makeRequest({
			action,
			postType,
			productType,
			keyword,
		}).then((response) => {
			setIsFetch(false);
			if (name === 'meta.academy_prerequisite_courses') {
				setIsFetch(false);
				const filterOptions = response?.data?.data.filter(
					(item) => parseInt(item.value) !== parseInt(values.post_ID)
				);
				setOptions(filterOptions);
			} else {
				setIsFetch(false);
				setOptions(response?.data?.data);
			}
		});
	};

	const onInputChangeHandler = debounce((searchKeyWord) => {
		const filterData = options.filter((item) =>
			item.label.toLowerCase().includes(searchKeyWord)
		);
		if (filterData.length === 0) {
			fetchDataHandler(searchKeyWord);
		}
	}, 500);

	const ID = name;

	return (
		<React.Fragment>
			<div className="academy-post-form-group">
				<div className="academy-post-form-info">
					{title && (
						<label
							htmlFor={ID}
							className={`academy-title ${whiteSpace ? ` ${whiteSpace}` : ''}`}
						>
							{title}
						</label>
					)}
					{subtitle && (
						<span className="academy-sub-title">{subtitle}</span>
					)}
				</div>
				<div className="academy-post-form-body">
					<AcademySelect
						id={ID}
						suffix={suffix}
						positionTop={position === 'top' ? '-100%' : '100%'}
						placeholder={
							placeholder
								? placeholder
								: sprintf(
										// translators: %s: postType
										__('Select a %s', 'academy'),
										postType
									)
						}
						value={
							isMulti ? value : value ? parseInt(value) : ''
						}
						onChangeHandler={(selected) =>
							isMulti
								? setFieldValue(name, selected)
								: setFieldValue(name, selected || 0)
						}
						onInputChange={onInputChangeHandler}
						options={options}
						isSearchable={true}
						isLoading={isFetch}
						onMenuOpen={fetchDataHandler}
						isClearable={isClearable}
						isMulti={isMulti}
					/>
					{desc && <span className="academy-desc">{desc}</span>}
				</div>
			</div>
		</React.Fragment>
	);
}

PostSelect.propTypes = propTypes;
