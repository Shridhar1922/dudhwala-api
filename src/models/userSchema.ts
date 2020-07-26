/** UserSchema handles user CRUD operations */

var mongoose = require('mongoose')
var helper = require('../libs/hepler')
var mongoose = require('mongoose')
import { uniqueValidtor } from '../libs/validator'

let UserSchema = new mongoose.Schema(
  {
    //firstName: { type: String, required: [true, "First name is required"] },
    name: { type: String, required: [true, 'Name is required'] },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: uniqueValidtor('user', 'email'),
        message: 'Email already exist',
      },
      unique: true,
      //required: [true, "Email is required"]
    },
    address: { type: String, required: [true, 'address is required'] },
    //city: { type: String, required: [true, "city is required"] },
    userType: { type: String, enum: ['user', 'supplier', 'admin', 'driver'] },
    status: { type: String, default: 'approved' },
    avatar: { type: String },
    mobile: {
      type: String,
      validate: {
        validator: uniqueValidtor('user', 'mobile'),
        message: 'Mobile already exist',
      },
      unique: true,
      required: [true, 'Mobile number is required'],
    },
    password: { type: String, required: [true, 'Password not provided'] },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'role',
      role: [true, 'Role not provided'],
    },
    documents: {
      idProof: String,
      idProofpath: String,
      idProofNumber: String,
      license: String,
      licensepath: String,
      licenseNumber: String,
      licenseIssuedDate: String,
      licenseExpiryDate: String,
    },
    productType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'productType',
    },
    // contract: {
    //   contractStatus: { type: String, default: "pending" },
    //   contract: String,
    //   contractPath: { type: String, default: "No document" }
    // },
    //documents:[{name:String,path:String}],
    supplierID: { type: String },
    isDeleted: { type: Boolean, default: false },
    freeCollection: { type: Boolean, default: true },
    //confirmCode: { type: String, unique: true }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
)

UserSchema.pre('save', function (next) {
  let user = this

  return helper.createHash(user.password, function (err, hash) {
    if (!err) {
      user.password = hash
      return next()
    } else {
      return next(err)
    }
  })
})

export const UserModel = mongoose.model('user', UserSchema)
