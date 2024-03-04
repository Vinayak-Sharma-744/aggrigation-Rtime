import mongoose from "mongoose";

export interface Task {
    username: any;
    _id: string;
    _userId: string;
    _projectId: string;
    taskName: string;
    startTime: string;
    endTime: string;
    description: string;
    IP_Address: string;
    status: string;
    createdAt: string;
    date: string;
    updatedAt: string;
    __v: number;
}

export interface UserData {

    todayNumberOfFilledUsers: {
        _id: string;
        name: string;
        email: string;
    }[];

    todayNumberOfUnfilledUsers: {
        _id: string;
        name: string;
        email: string;
    }[];
}

export interface User {
    _id: string;
    email: string;
    name: string;
    profilePic: string;
    role: {
        _id: string;
        name: string;
        description: string;
        permissions: string[];
        status: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
    status: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    theme?: boolean;
    time?: string;
    phone?: number;
}

export interface TimeSheet {
    _id: {
        id: string; // Using string type for simplicity, adjust if necessary
    };
    _userId: {
        id: string; // Using string type for simplicity, adjust if necessary
    };
    _projectId: {
        _id: {
            id: string; // Using string type for simplicity, adjust if necessary
        };
        projectName: string;
    };
    taskName: string;
    startTime: Date;
    endTime: Date;
    description: string;
    IP_Address: string;
    status: string;
    createdAt: Date;
    projectName?: string;
    updatedAt: Date;
    __v: number;
}

 export interface Id {
    _id: mongoose.Types.ObjectId
}

export interface TimeSheetData {
    _userId: string;
    _projectId: string;
    taskName: string;
    startTime: string; // Assuming this will be a string representation of date
    endTime: string; // Assuming this will be a string representation of date
    description: string;
}

export interface Project {
    _id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
    projectName: string;
}

export interface unFilledUsersByDate {
    _id: string;
    date: string;
    unfilledUserIds: string[];
}

export interface Count{
     [ket: string]: number 
}