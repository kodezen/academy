export const convertTo24Hour = (time) => {
	const [hours, minutes, meridian] = time.split(/:| /);
	let militaryHours = parseInt(hours);

	if (meridian === 'PM' && militaryHours !== 12) {
		militaryHours += 12;
	} else if (meridian === 'AM' && militaryHours === 12) {
		militaryHours = 0;
	}

	return `${militaryHours.toString().padStart(2, '0')}:${minutes}`;
};

export const getBookingSlotsByDateTime = (
	selectedDate,
	scheduleTimes,
	slotDuration = 15
) => {
	const allSlots = scheduleTimes.reduce((acc, item) => {
		// Define the start and end time
		const startTime = new Date(
			`${selectedDate}T${convertTo24Hour(item?.start_time)}`
		);
		const endTime = new Date(
			`${selectedDate}T${convertTo24Hour(item?.end_time)}`
		);

		// Calculate the number of slots between start and end time
		const totalSlots = Math.floor(
			(endTime - startTime) / (1000 * 60 * slotDuration)
		);

		// Create an array to store the appointment slots
		const appointmentSlots = [];

		// Loop through the total number of slots and create each slot
		for (let i = 0; i < totalSlots; i++) {
			// Calculate the start time of the slot
			const slotStartTime = new Date(
				startTime.getTime() + i * 1000 * 60 * slotDuration
			);

			// Calculate the end time of the slot
			const slotEndTime = new Date(
				slotStartTime.getTime() + slotDuration * 60 * 1000
			);

			// Format the start and end time into a string
			const formattedStartTime = slotStartTime.toLocaleTimeString('en', {
				hour: '2-digit',
				minute: '2-digit',
			});
			const formattedEndTime = slotEndTime.toLocaleTimeString('en', {
				hour: '2-digit',
				minute: '2-digit',
			});

			// Add the formatted start and end time to the appointment slots array
			appointmentSlots.push({
				start_time: formattedStartTime,
				end_time: formattedEndTime,
			});
		}
		acc = [...acc, ...appointmentSlots];
		return acc;
	}, []);

	return allSlots;
};
