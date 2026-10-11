import { __ } from '@wordpress/i18n';
import { useFormikContext } from 'formik';
import CustomFieldsBox from '@Components/CustomFieldsBox';

const CustomFieldGroup = () => {
	const { values, setFieldValue } = useFormikContext();

	return (
		<CustomFieldsBox
			postType="academy_courses"
			label={__('courses', 'academy')}
			values={values}
			setFieldValue={setFieldValue}
		/>
	);
};

export default CustomFieldGroup;
