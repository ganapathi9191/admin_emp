import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ["present", "absent", "leave"],
        required: true,
    },
    dayType: {
        type: String,
        enum: ["fullDay", "halfDay", "extraHours"],
        required: function () {
            return this.status === "present";
        },
    },
    hoursWorked: {
        type: Number,
        required: function () {
            return this.status === "present" && this.dayType === "halfDay";
        },
    },
});

export default mongoose.model("Attendance", attendanceSchema);
