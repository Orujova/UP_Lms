'use client'

import React, { useEffect, useState } from 'react';
import InputComponent from '../inputComponent';
import SelectComponent from '../selectComponent';
import { useDispatch, useSelector } from 'react-redux';
import { functionalAreaAsync } from '@/redux/functionalArea/functionalArea';
import { residentalAreaAsync } from '@/redux/residentalArea/residentalArea';
import { roleAsync } from '@/redux/role/role';
import { subDivisionAsync } from '@/redux/subDivision/subDivision';
import { divisionAsync } from '@/redux/division/division';
import { positionGroupAsync } from '@/redux/positionGroup/positionGroup';
import { departmentAsync } from '@/redux/department/department';
import { projectAsync } from '@/redux/project/project';
import { positionAsync } from '@/redux/position/position';
import { genderAsync } from '@/redux/gender/gender';
import SuccessComponent from '../successComponent'; // SuccessComponent eklendi

//style
import './addUserFormComponent.scss';

//image
import icon from '@/images/importantIcon.svg';
import MultiSelect from '../multiSelect';

const managerialLevelOptions = [{ id: 'Manager', name: 'Manager' }, { id: 'Non-manager', name: 'Non-manager' }];

export default function AddUserFormComponent() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: '',
    finCode: '',
    birthDay: '',
    gender: '',
    badgeNumber: '',
    startDate: '',
    position: '',
    residentalArea: '',
    functionalArea: '',
    managerialLevel: '',
    project: '',
    department: '',
    positionGroup: '',
    division: '',
    subDivision: '',
    role: '',
  });

  const [isSuccess, setIsSuccess] = useState(false); // Başarı durumu eklendi
  const [responseMessage, setResponseMessage] = useState(''); // Yanıt mesajı eklendi

  useEffect(() => {
    dispatch(functionalAreaAsync());
    dispatch(residentalAreaAsync());
    dispatch(roleAsync());
    dispatch(subDivisionAsync());
    dispatch(divisionAsync());
    dispatch(positionGroupAsync());
    dispatch(departmentAsync());
    dispatch(projectAsync());
    dispatch(positionAsync());
    dispatch(genderAsync());
  }, [dispatch]);

  const functionalArea = useSelector((state) => state.functionalArea.data?.[0]?.functionalAreas) || [];
  const residentalArea = useSelector((state) => state.residentalArea.data?.[0]?.residentalAreas) || [];
  const role = useSelector((state) => state.role.data?.[0]?.roles) || [];
  const subDivision = useSelector((state) => state.subDivision.data?.[0]?.subDivisions) || [];
  const division = useSelector((state) => state.division.data?.[0]?.divisions) || [];
  const positionGroup = useSelector((state) => state.positionGroup.data?.[0]?.positionGroups) || [];
  const department = useSelector((state) => state.department.data?.[0]?.departments) || [];
  const project = useSelector((state) => state.project.data?.[0]?.projects) || [];
  const position = useSelector((state) => state.position.data) || [];
  const gender = useSelector((state) => state.gender.data) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const queryParams = new URLSearchParams({
      UserName: formData.username,
      FirstName: formData.name,
      LastName: formData.surname,
      Email: formData.email,
      Badge: formData.badgeNumber,
      Pin: formData.finCode,
      PhoneNumber: formData.phoneNumber,
      Password: formData.password,
      ManagerialLevel: formData.managerialLevel,
      BirthDate: formData.birthDay, // YYYY-MM-DD format
      StartedDate: formData.startDate, // YYYY-MM-DD format
      ResidentalAreaId: formData.residentalArea,
      GenderId: formData.gender,
      FunctionalAreaId: formData.functionalArea,
      DepartmentId: formData.department,
      ProjectId: formData.project,
      DivisionId: formData.division,
      SubDivisionId: formData.subDivision,
      PositionGroupId: formData.positionGroup,
      PositionId: formData.position,
      RoleIds: [formData.role], // RoleIds array olarak gönderiliyor
    }).toString();

    try {
      const response = await fetch(`https://bravoadmin.uplms.org/api/AdminApplicationUser/CreateUser?${queryParams}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': 'Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IkhQcyIsInJvbGUiOiJBZG1pbiIsImV4cCI6MTc1NTE5MTI0NX0.OIsHL8bGXDvZfKk1cfi3zOrxZ9HkJXAo3WcL5F233nY'
        },
      });

      const result = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setResponseMessage("User created successfully!");
      } else {
        setResponseMessage(result.message || "Failed to create user.");
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setResponseMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      {isSuccess ? (
        <SuccessComponent link="/admin/dashboard/users" title="Users" />
      ) : (
        <form className="addUserFormComponent" onSubmit={handleSubmit}>
          <div className="form">
            <p className="col12">Personal Information</p>
            <InputComponent
              placeholder="Name"
              type="text"
              text="Name"
              required
              className="col4"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="Surname"
              type="text"
              text="Surname"
              required
              className="col4"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="Username"
              type="text"
              text="Username"
              required
              className="col4"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="Password"
              type="password"
              text="Password"
              required
              className="col4"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="Confirm Password"
              type="password"
              text="Confirm Password"
              required
              className="col4"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="email@gmail.com"
              type="email"
              text="Email Address"
              required
              className="col4"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="Ex: +99450 567 43 56"
              type="text"
              text="Phone Number"
              required
              className="col4"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <InputComponent
              img={icon}
              placeholder="Fin Code"
              type="text"
              text="Fin Code"
              required
              className="col4"
              name="finCode"
              value={formData.finCode}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="mm/dd/yy"
              type="date"
              text="Birth Day"
              required
              className="col4"
              name="birthDay"
              value={formData.birthDay}
              onChange={handleChange}
            />
            <SelectComponent
              text="Gender"
              required
              className="col4"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={gender}
            />
          </div>
          <div className="form">
            <p className="col12">Technical Information</p>
            <InputComponent
              placeholder="Ex: 10904"
              type="text"
              text="Badge number"
              required
              className="col4"
              name="badgeNumber"
              value={formData.badgeNumber}
              onChange={handleChange}
            />
            <InputComponent
              placeholder="mm/dd/yy"
              type="date"
              text="Start date"
              required
              className="col4"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
            <SelectComponent
              text="Position"
              required
              className="col4"
              name="position"
              value={formData.position}
              onChange={handleChange}
              options={position}
            />
            <SelectComponent
              text="Residential Area"
              required
              className="col4"
              name="residentalArea"
              value={formData.residentalArea}
              onChange={handleChange}
              options={residentalArea}
            />
            <SelectComponent
              text="Functional Area"
              required
              className="col4"
              name="functionalArea"
              value={formData.functionalArea}
              onChange={handleChange}
              options={functionalArea}
            />
            <SelectComponent
              text="Managerial Level"
              required
              className="col4"
              name="managerialLevel"
              value={formData.managerialLevel}
              onChange={handleChange}
              options={managerialLevelOptions}
            />
            <SelectComponent
              text="Project"
              required
              className="col4"
              name="project"
              value={formData.project}
              onChange={handleChange}
              options={project}
            />
            <SelectComponent
              text="Department"
              required
              className="col4"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={department}
            />
            <SelectComponent
              text="Position Group"
              required
              className="col4"
              name="positionGroup"
              value={formData.positionGroup}
              onChange={handleChange}
              options={positionGroup}
            />
            <SelectComponent
              text="Division"
              required
              className="col4"
              name="division"
              value={formData.division}
              onChange={handleChange}
              options={division}
            />
            <SelectComponent
              text="Sub Division"
              required
              className="col4"
              name="subDivision"
              value={formData.subDivision}
              onChange={handleChange}
              options={subDivision}
            />
            {/* <SelectComponent
              text="Roles"
              required
              className="col4"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={role}
            /> */}

            <MultiSelect
              text="Roles"
              className="col4"
              required={true}
              options={role}
              value={formData.role}
              onChange={(selectedRoles) => setFormData({ ...formData, role: selectedRoles })}
              name="role"
            />

          </div>
          <div className="buttons">
            <button type="submit" className="next">Save</button>
            <button type="button" className="cancel">Cancel</button>
          </div>
        </form>
      )}
      {responseMessage && (
        <div className={`mt-4 text-center text-lg font-semibold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {responseMessage}
        </div>
      )}
    </div>
  );
}