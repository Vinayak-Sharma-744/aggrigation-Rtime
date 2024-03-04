import { Id } from "../../interface"
import { projectModel } from "../../models/project"

export const getAllProjectDetails = () => {

    return new Promise((resolve, reject) => {

        projectModel.find().then(resolve).catch(reject)

    })
}

export const getProjectDetailsById = (_id: Id) => {

    return new Promise((resolve, reject) => {

        projectModel.find({ _id: _id }).then(resolve).catch(reject)
    })
}

export const getProjectDetailsByName= (projectName: String) => {
    
    return new Promise((resolve, reject) => {
        
        projectModel.find({projectName:projectName}).then(resolve).catch(reject)
    })
}

export const addProjectDetails = (data:String) => {

    return new Promise((resolve, reject) => {

        projectModel.create(data).then(resolve).catch(reject)

    })
}

export const updateProjectDetails = (_id: Id, data: String) => {

    return new Promise((resolve, reject) => {

        projectModel.findOneAndUpdate({ _id: _id }, { $set: data }, { new: true }).then(resolve).catch(reject)
    })
}

export const delPermanentProjectDetails = (_id: Id) => {

    return new Promise((resolve, reject) => {

        projectModel.findOneAndUpdate({ _id: _id }, { $set: { status: "DELETED" } }, { new: true }).then(resolve).catch(reject)
    })
}

export const delProjectDetails = (_id: Id,data:String) => {

    return new Promise((resolve, reject) => {

        projectModel.findOneAndUpdate({ _id: _id }, { $set: data }, { new: true }).then(resolve).catch(reject)
    })
}