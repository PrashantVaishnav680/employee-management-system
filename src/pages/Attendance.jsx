import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/client'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'

const Attendance = () => {
  const { user } = useAuth()

  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendanceData, setAttendanceData] = useState([])

  const isAdmin = user.role === 'admin'

  const load = useCallback(async () => {
    const [{ data: attendanceRecords }, employeeResult] = await Promise.all([
      api.get('/attendance'),
      isAdmin ? api.get('/employees') : Promise.resolve({ data: [] }),
    ])

    setRecords(attendanceRecords)
    setEmployees(employeeResult.data)

    if (isAdmin) {
      setAttendanceData(
        employeeResult.data.map((emp) => ({
          employee: emp._id,
          name: emp.name,
          department: emp.department,
          status: 'Present',
        }))
      )
    }
  }, [isAdmin])

  useEffect(() => { load() }, [load])

  const handleStatusChange = (id, status) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.employee === id
          ? { ...item, status }
          : item
      )
    )
  }
  const markAllPresent = () => {
    setAttendanceData((prev) =>
      prev.map((item) => ({
        ...item,
        status: "Present",
      }))
    )
  }
  const markAllAbsent = () => {
    setAttendanceData((prev) =>
      prev.map((item) => ({
        ...item,
        status: "Absent",
      }))
    )
  }
  const submitAttendance = async () => {
    try {
      await api.post("/attendance/bulk", {
        date: selectedDate,
        attendance: attendanceData,
      })

      toast.success("Attendance Submitted")

      load()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Failed to submit attendance"
      )
    }
  }

  return (
  <>
    <PageHeader
      eyebrow="Presence"
      title="Attendance"
      description="Mark daily attendance and track attendance history."
    />

    {isAdmin && (
      <section className="panel">

        <div className="mb-6 flex items-center justify-between">

          <div className="form-field">
            <span>Date</span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={markAllPresent}
              className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-white"
            >
              Mark All Present
            </button>

            <button
              type="button"
              onClick={markAllAbsent}
              className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white"
            >
              Mark All Absent
            </button>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="border-b border-white/10">

                <th className="p-3 text-left">
                  Employee
                </th>

                <th className="p-3 text-left">
                  Department
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {attendanceData.map((emp) => (

                <tr
                  key={emp.employee}
                  className="border-b border-white/10"
                >

                  <td className="p-3">
                    {emp.name}
                  </td>

                  <td className="p-3">
                    {emp.department}
                  </td>

                  <td className="p-3">

                    <select
                      value={emp.status}
                      onChange={(e) =>
                        handleStatusChange(
                          emp.employee,
                          e.target.value
                        )
                      }
                      className="rounded-lg bg-slate-800 px-3 py-2"
                    >
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Half Day</option>
                      <option>Remote</option>
                    </select>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="mt-6 flex justify-end">

          <button
            type="button"
            onClick={submitAttendance}
            className="rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-slate-900"
          >
            Submit Attendance
          </button>

        </div>

      </section>
    )}

    <section className="panel mt-6">

      {!records.length ? (

        <EmptyState />

      ) : (

        records.map((record) => (

          <div
            key={record._id}
            className="mb-3 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-5"
          >

            <strong>
              {record.employee?.name || user.name}
            </strong>

            <span>
              {new Date(record.date).toLocaleDateString()}
            </span>

            <span>
              {record.status}
            </span>

            <span>
              {record.checkIn || "--"} - {record.checkOut || "--"}
            </span>

            <span className="text-gray-400">
              {record.notes || "--"}
            </span>

          </div>

        ))

      )}

    </section>

  </>
  )
}

export default Attendance
