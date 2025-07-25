import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { COLORS, SIZES, FONT_FAMILY, FONTS } from "../../constants/constants";

const CustomDatePicker = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false); // Controls the visibility of the date picker modal
  const [date, setDate] = useState(value ? new Date(value) : new Date()); // Local state for the selected date

  const handleConfirm = (selectedDate) => {
    setOpen(false); // Close the date picker modal
    setDate(selectedDate); // Update the local date state
    onChange(selectedDate.toISOString().split('T')[0]); // Format the date as "YYYY-MM-DD" and pass it to the parent
  };

  return (
    <View style={styles.datePickerContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dateInput} // Styled like TextInput
        onPress={() => setOpen(true)} // Open the date picker modal
      >
        <Text style={{ color: value ? '#000' : '#aaa' }}>
          {value || 'Select Date'} {/* Show placeholder or selected date */}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open} // Controls the visibility of the modal
        date={date} // The currently selected date
        mode="date" // Date picker mode
        onConfirm={handleConfirm} // Called when a date is selected
        onCancel={() => setOpen(false)} // Close the modal on cancel
      />
    </View>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fafafa',
  },
});

export default CustomDatePicker;