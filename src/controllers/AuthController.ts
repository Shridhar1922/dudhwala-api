import {
  JsonController,
  Get,
  Req,
  Res,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseBefore,
  CurrentUser,
  UploadedFile,
  QueryParams,
  HeaderParam,
} from 'routing-controllers'
import { UserRepository } from '../repositories/userRepositories'
import { NotificationRepository } from '../repositories/notificationRepository'
import * as fs from 'fs'
import * as helper from '../libs/hepler'
import authService from '../libs/authService'
import { authorizeAction } from '../middlewares/authorizeAction'
import * as randomstring from 'randomstring'
import * as multer from 'multer'
import { capId, createHash } from '../libs/hepler'
import Mailer from '../libs/Mailer'

const pathToAttachment = `public/uploads/contract/Contract_Supplier.pdf`
const attachment = fs.readFileSync(pathToAttachment).toString('base64')

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const dest = `uploads/documents/${file.fieldname}/`
    try {
      if (!fs.existsSync(`public/${dest}`)) {
        fs.mkdirSync(`public/${dest}`)
      }

      callback(null, `public/${dest}`)
    } catch (e) {
      console.log(e.message)
    }
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + '-' + Date.now() + file.originalname.replace(' ', '_'),
    )
  },
})

const upload = multer({ storage })

@JsonController('/auth')
export class AuthController {
  constructor(
    public userRepository: UserRepository,
    public notificationRepository: NotificationRepository,
  ) {
    this.userRepository = new UserRepository()
    this.notificationRepository = new NotificationRepository()
  }

  @Get('/ping')
  ping(@Req() request: any, @Res() response: any) {
    return response.send({ message: 'Hello there..' })
  }

  @UseBefore(authorizeAction('user', 'read'))
  @Get('/users/:id')
  async getUser(@Param('id') id: string, @Res() res: any) {
    try {
      const user = await this.userRepository.findByEmail(id)
      if (user) {
        delete user['password']
        console.log('User fetched', user)
        return res.send({ success: true, message: 'User found', data: user })
      }
      return {
        success: true,
        message: 'User not found',
        data: {},
      }
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null })
    }
  }

  @Get('/currentUser')
  async getCurrent(@CurrentUser() user: any, @Res() res: any) {
    try {
      console.log('Getting user')
      if (user) {
        delete user['password']
        return res.send({ success: true, message: 'User found', data: user })
      }

      return res.status(200).send({
        success: false,
        message: 'User not found',
        data: {},
      })
    } catch (e) {
      console.log('Could not get curernt user', e)
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null })
    }
  }

  @Post('/updateProfile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: any,
    @Res() res: any,
  ) {
    try {
      console.log('USER....', user)

      if (user) {
        let { firstName, lastName, mobile, address } = body
        firstName = firstName && typeof firstName === 'string' ? firstName : ''
        lastName = lastName && typeof lastName === 'string' ? lastName : ''
        // email = email && typeof email === "string" ? email : "";
        mobile = mobile && typeof mobile === 'string' ? mobile : ''
        address = address && typeof address === 'string' ? address : ''
        // console.log("us", user);
        const result = await this.userRepository.update(
          { _id: user._id },
          { firstName, lastName, mobile, address },
        )

        return res.send({
          success: true,
          message: 'User details updated successfully',
          data: {
            firstName: result['firstName'],
            lastName: result['lastName'],
            mobile: result['mobile'],
            address: result['address'],
          },
        })
      }

      return res.status(500).send({
        success: false,
        message: 'User not found',
        data: {},
      })
    } catch (e) {
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null })
    }
  }

  @Post('/user/changeAvatar')
  async saveFile(@UploadedFile('avatar') file: any, @CurrentUser() user: any) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'No avatar is present!',
          data: null,
        }
      }

      const filename = 'avatar_' + file['originalname']
      const dest = 'public/uploads/avatar/'
      const path = dest + filename
      if (!fs.existsSync(`${dest}`)) {
        fs.mkdirSync(`${dest}`)
      }
      fs.writeFileSync(path, file.buffer)
      const result = await this.userRepository.update(
        { _id: user._id },
        { avatar: 'uploads/avatar/' + filename },
      )
      return {
        success: true,
        message: 'Uploaded avatar',
        data: { avatar: result['avatar'] },
      }
    } catch (e) {
      return { success: false, message: e.message, data: null }
    }
  }

  // logged in user
  @Post('/userrRegistration')
  //@UseBefore(upload.fields([{ name: "license" }, { name: "idProof" }]))
  async userrRegistration(
    @Body() body: any,
    @Req() req,
    @Res() res,
    @HeaderParam('crt_ssn') sessionId: string,
  ) {
    console.log('userrRegistration...', body)
    //console.log("req.files...", req.files);
    let { name, email, password, cpassword, mobile } = body
    if (name && password && cpassword && mobile) {
      if (typeof password === 'string' && password.length > 5) {
        if (password === cpassword) {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
          if (re.test(email)) {
            let userData = {
              name,
              email,
              mobile,
              password,
            }

            userData['userType'] = 'user'
            try {
              //console.log("userData...", userData);
              const userDetails = await this.userRepository.store(userData)
              return res.send({
                success: true,
                message: 'User registred successfully',
                data: userData,
              })
            } catch (e) {
              if (e.name === 'ValidationError') {
                return {
                  success: false,
                  message: e.message,
                  data: null,
                }
              }
              return res.status(500).send({
                success: false,
                message: e.message,
                data: null,
              })
            }
          } else {
            // EMAIL NOT VALID
            return res.status(200).send({
              success: false,
              message: 'Email ID is not valid',
              data: null,
            })
          }
        } else {
          // PASSWORD DOES NOT MATCH
          return res.status(200).send({
            success: false,
            message: 'Password does not match',
            data: null,
          })
        }
      } else {
        // PASSWORD IS NOT STRONG
        return {
          success: false,
          message: 'Password length must be greater than 5',
          data: null,
        }
      }
    } else {
      // FIELDS ARE EMPTY
      return res.status(200).send({
        success: false,
        message: 'Fields are mandatory',
        data: null,
      })
    }
  }

  @Put('/userEdit/:id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: any,
    @Req() req: any,
  ) {
    try {
      let { name, email, password, cpassword, mobile } = body

      //console.log("UPDATE User REQUEST..", body);
      name = typeof name === 'string' && name ? name : ''
      email = typeof email === 'string' && email ? email : ''
      mobile = typeof mobile === 'string' && mobile ? mobile : ''
      password = typeof password === 'string' && password ? password : ''
      cpassword = typeof cpassword === 'string' && cpassword ? cpassword : ''

      let update = {
        name,
        email,
        password,
        cpassword,
        mobile,
      }

      const User = await this.userRepository.findOneUser({ _id: id })
      //console.log("User..", User);
      //console.log("Final UPDATE User REQ ..........", update);
      const result = await this.userRepository.update({ id }, update)
      if (result) {
        return {
          success: true,
          message: 'User Details updated successfully',
          data: result,
        }
      } else {
        return {
          success: false,
          message: 'Could not update',
          data: null,
        }
      }
    } catch (e) {
      console.log('error ', e.message)
      return { success: false, message: 'Something went wrong', data: null }
    }
  }

  //@UseBefore(authorizeAction("user", "update"))
  @Delete('/userDelete/')
  async delete(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body
      ids = ids && typeof ids === 'object' && ids instanceof Array ? ids : [ids]
      const result = await this.userRepository.softDelete(ids)
      return {
        success: true,
        message: 'user deleted successfully',
        data: result,
      }
    } catch (e) {
      console.log('Error', e)
      return { success: false, message: e.message, data: null }
    }
  }

  // logged in user
  @Post('/register')
  @UseBefore(upload.fields([{ name: 'license' }, { name: 'idProof' }]))
  async register(
    @Body() body: any,
    @Req() req,
    @Res() res,
    @HeaderParam('crt_ssn') sessionId: string,
  ) {
    //console.log("body...", body);
    //console.log("req.files...", req.files);
    let {
      firstName,
      lastName,
      username,
      email,
      password,
      cpassword,
      mobile,
      address,
      city,
      license,
      idProof,
      licenseNumber,
      licenseIssuedDate,
      licenseExpiryDate,
    } = body

    let notificationObj = {}

    if (
      firstName &&
      lastName &&
      username &&
      email &&
      password &&
      cpassword &&
      mobile &&
      city &&
      address &&
      licenseIssuedDate &&
      licenseExpiryDate
    ) {
      if (typeof password === 'string' && password.length > 5) {
        if (password === cpassword) {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
          if (re.test(email)) {
            let userData = {
              firstName,
              lastName,
              username,
              email,
              mobile,
              password,
              address,
              city,
            }

            userData['userType'] = 'user'

            const license = req && req.files ? req.files['license'] : []

            const idProof = req && req.files ? req.files['idProof'] : []

            if (license && idProof) {
              const paths = license.map((image) => {
                const split = image.path.split('public/')
                if (split && split[1]) {
                  return { path: split[1] }
                }
              })

              const idProofpaths = idProof.map((idProof) => {
                const split = idProof.path.split('public/')
                if (split) {
                  return { path: split[1] }
                }
              })
              userData['documents'] = {
                idProof: 'Id Proof',
                idProofpath: idProofpaths[0].path,
                license: 'Licence',
                licensepath: paths[0].path,
                licenseNumber: licenseNumber,
                licenseIssuedDate: licenseIssuedDate,
                licenseExpiryDate: licenseExpiryDate,
              }
            } else {
              return {
                success: false,
                message: 'license and idProof are required.',
              }
            }

            try {
              //console.log("userData...", userData);

              let notificationObj = {}
              notificationObj['title'] = 'New user registered..!'
              notificationObj['notificationFor'] = 'Admin'
              notificationObj['redirectTo'] = 'users'

              const notification = await this.notificationRepository.store(
                notificationObj,
              )
              const sendNotification = req.app.get('sendNotification')
              if (sendNotification) {
                //console.log("IN sendNotification.....");
                sendNotification(notification)
              }

              //console.log("notificationObj...", notificationObj);

              const userDetails = await this.userRepository.store(userData)

              if (userDetails && typeof userDetails === 'object') {
                //const token = await authService.createToken(userDetails);
                if (!sessionId) {
                  var sg = require('sendgrid')(
                    //"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" // For chaitrali@1
                    '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',
                  )

                  var request = sg.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: {
                      personalizations: [
                        {
                          to: [
                            {
                              email: email,
                            },
                          ],
                          subject: 'Car Rental',
                        },
                      ],
                      from: {
                        email: 'wsiyaruh@wsiyaruh.com',
                        name: 'Waseet Alsayara',
                      },
                      content: [
                        {
                          type: 'text/plain',
                          value:
                            'Hello' +
                            ' ' +
                            firstName +
                            ',' +
                            'Welcome to the Waseet Alsayara.Your details submitted successfully, pending for approval',
                        },
                      ],
                    },
                  })

                  //With callback
                  sg.API(request, function (error, response) {
                    if (error) {
                      //console.log('Error response received', error);
                      //res(error);
                    } else {
                      console.log('response', response)
                      console.log('success, Mail sent successfully')
                    }
                  })

                  return {
                    success: true,
                    message: 'User registered successfully..!',
                    // data: {
                    //   _token: token,
                    //   expiresIn: "72h",
                    //   role: userDetails["role"] ? userDetails["role"].name : ""
                    // }
                  }
                } else {
                  //await this.notificationRepository.store(notificationObj);
                  // Session ID present merge cart items
                  return {
                    success: true,
                    message: 'User registered successfully..!',
                    // data: {
                    //   _token: token,
                    //   expiresIn: "72h",
                    //   role: userDetails["role"] ? userDetails["role"].name : ""
                    // }
                  }
                }
              }
            } catch (e) {
              if (e.name === 'ValidationError') {
                return {
                  success: false,
                  message: e.message,
                  data: null,
                }
              }
              return res.status(500).send({
                success: false,
                message: e.message,
                data: null,
              })
            }
          } else {
            // EMAIL NOT VALID
            return res.status(200).send({
              success: false,
              message: 'Email ID is not valid',
              data: null,
            })
          }
        } else {
          // PASSWORD DOES NOT MATCH
          return res.status(200).send({
            success: false,
            message: 'Password does not match',
            data: null,
          })
        }
      } else {
        // PASSWORD IS NOT STRONG
        return {
          success: false,
          message: 'Password length must be greater than 5',
          data: null,
        }
      }
    } else {
      // FIELDS ARE EMPTY
      return res.status(200).send({
        success: false,
        message: 'Fields are mandatory',
        data: null,
      })
    }
  }

  @Post('/login')
  async login(
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
    @HeaderParam('crt_ssn') sessionId: string,
  ) {
    try {
      const { email, password } = body
      let userDetails = await this.userRepository.findByEmail(email)
      //console.log("userDetails", userDetails);
      if (userDetails) {
        let hashPassword = userDetails['password']
        delete userDetails['password']
        try {
          const matched = await helper.compareHash(password, hashPassword)

          if (matched) {
            const token = await authService.createToken(userDetails)
            if (!sessionId) {
              return {
                success: true,
                message: 'Logged in successfully..!',
                data: {
                  _token: token,
                  expiresIn: '72h',
                  role: userDetails['role'] ? userDetails['role'].name : '',
                },
              }
            } else {
              return {
                success: true,
                message: 'Logged in successfully..!',
                data: {
                  _token: token,
                  expiresIn: '72h',
                  role: userDetails['role'] ? userDetails['role'].name : '',
                },
              }
            }
          } else {
            console.log('Incorrect E-mail id or password')
            return {
              success: false,
              message: 'Incorrect E-mail id or password',
              data: null,
            }
          }
        } catch (e) {
          console.log('Error occured', e)
          return { success: false, message: 'Could not login' }
        }
      } else {
        console.log('Incorrect E-mail id or password 2')
        // USER NOT FOUND
        return {
          success: false,
          message: 'No User with this credentials',
          data: null,
        }
      }
    } catch (e) {
      console.log('Got error', e)
      return { success: false, message: e.message, data: e }
    }
  }

  @Post('/supplierRegistration')
  @UseBefore(upload.fields([{ name: 'license' }, { name: 'idProof' }]))
  async supplierRegistration(
    @Body() body: any,
    @Req() req,
    @Res() res,
    @HeaderParam('crt_ssn') sessionId: string,
  ) {
    let {
      name,
      email,
      password,
      cpassword,
      mobile,
      address,
      license,
      idProof,
      licenseNumber,
      idProofNumber,
      licenseIssuedDate,
      licenseExpiryDate,
      productType,
    } = body

    //console.log('body...', body)
    //console.log("req.files...", req.files);

    if (
      name &&
      email &&
      password &&
      cpassword &&
      mobile &&
      address &&
      productType
    ) {
      if (typeof password === 'string' && password.length > 5) {
        if (password === cpassword) {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
          if (re.test(email)) {
            let userData = {
              name,
              email,
              mobile,
              password,
              address,
              productType,
            }

            let supplierID = randomstring.generate({
              length: 7,
              charset: 'numeric',
              capitalization: 'uppercase',
            })

            userData['userType'] = 'supplier'
            userData['supplierID'] = 'SUP-MilkEWay' + supplierID

            license = req && req.files ? req.files['license'] : []

            idProof = req && req.files ? req.files['idProof'] : []

            if (license && licenseIssuedDate && licenseExpiryDate) {
              const paths = license.map((image) => {
                const split = image.path.split('public/')
                if (split && split[1]) {
                  return { path: split[1] }
                } else {
                  return { path: '' }
                }
              })

              userData['documents'] = {
                license: 'Licence',
                licensepath: paths[0].path,
                licenseNumber: licenseNumber,
                licenseIssuedDate: licenseIssuedDate,
                licenseExpiryDate: licenseExpiryDate,
              }
            } else if (
              license == null &&
              licenseIssuedDate == null &&
              licenseExpiryDate == null
            ) {
              userData['documents'] = {
                license: 'Licence',
                licensepath: '',
                licenseNumber: licenseNumber,
                licenseIssuedDate: '',
                licenseExpiryDate: '',
              }
            }

            if (idProof) {
              const idProofpaths = idProof.map((idProof) => {
                const split = idProof.path.split('public/')
                if (split) {
                  return { path: split[1] }
                }
              })

              userData['documents'] = {
                idProof: 'Id Proof',
                idProofpath: idProofpaths[0].path,
                idProofNumber: idProofNumber,
                license: 'Licence',
                licensepath: '',
                licenseNumber: licenseNumber,
                licenseIssuedDate: licenseIssuedDate,
                licenseExpiryDate: licenseExpiryDate,
              }
            } else if (idProof == null) {
              return res.status(200).send({
                success: false,
                message: 'idProof is mandatory',
                data: null,
              })
            }

            if (license && licenseIssuedDate && licenseExpiryDate && idProof) {
              const paths = license.map((image) => {
                const split = image.path.split('public/')
                if (split && split[1]) {
                  return { path: split[1] }
                } else {
                  return { path: '' }
                }
              })

              const idProofpaths = idProof.map((idProof) => {
                const split = idProof.path.split('public/')
                if (split) {
                  return { path: split[1] }
                }
              })

              userData['documents'] = {
                idProof: 'Id Proof',
                idProofpath: idProofpaths[0].path,
                idProofNumber: idProofNumber,
                license: 'Licence',
                licensepath: paths[0].path,
                licenseNumber: licenseNumber,
                licenseIssuedDate: licenseIssuedDate,
                licenseExpiryDate: licenseExpiryDate,
              }
            }

            //console.log('supplierRegistration DATA...', userData)

            try {
              const userDetails = await this.userRepository.store(userData)
              if (userDetails && typeof userDetails === 'object') {
                //const token = await authService.createToken(userDetails);
                if (!sessionId) {
                  return {
                    success: true,
                    message: 'Supplier registered successfully..!',
                    // data: {
                    //   _token: token,
                    //   message: "Supplier registered successfully..!",
                    //   expiresIn: "72h",
                    //   role: userDetails["role"] ? userDetails["role"].name : ""
                    // }
                  }
                } else {
                  // Session ID present merge cart items
                  return {
                    success: true,
                    message: 'Supplier registered successfully..!',
                    // data: {
                    //   _token: token,
                    //   expiresIn: "72h",
                    //   role: userDetails["role"] ? userDetails["role"].name : ""
                    // }
                  }
                }
              }
            } catch (e) {
              if (e.name === 'ValidationError') {
                return {
                  success: false,
                  message: e.message,
                  data: null,
                }
              }
              return res.status(500).send({
                success: false,
                message: e.message,
                data: null,
              })
            }
          } else {
            // EMAIL NOT VALID
            return res.status(200).send({
              success: false,
              message: 'Email ID is not valid',
              data: null,
            })
          }
        } else {
          // PASSWORD DOES NOT MATCH
          return res.status(200).send({
            success: false,
            message: 'Password does not match',
            data: null,
          })
        }
      } else {
        // PASSWORD IS NOT STRONG
        return {
          success: false,
          message: 'Password length must be greater than 5',
          data: null,
        }
      }
    } else {
      // FIELDS ARE EMPTY
      return res.status(200).send({
        success: false,
        message: 'Fields are mandatory',
        data: null,
      })
    }
  }

  @Put('/supplierEdit/:id')
  async updatesupplier(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: any,
    @Req() req: any,
  ) {
    try {
      let {
        name,
        email,
        password,
        cpassword,
        mobile,
        address,
        license,
        idProof,
        licenseNumber,
        idProofNumber,
        licenseIssuedDate,
        licenseExpiryDate,
        productType,
      } = body

      //console.log("UPDATE User REQUEST..", body);
      name = typeof name === 'string' && name ? name : ''
      email = typeof email === 'string' && email ? email : ''
      mobile = typeof mobile === 'string' && mobile ? mobile : ''
      address = typeof address === 'string' && address ? address : ''

      let update = {
        name,
        email,
        password,
        cpassword,
        mobile,
        address,
        license,
        idProof,
        licenseNumber,
        idProofNumber,
        licenseIssuedDate,
        licenseExpiryDate,
        productType,
      }

      if (typeof productType === 'string') {
        productType = productType.split(', ')
      }
      productType =
        typeof productType === 'object' && productType ? productType : ''

      const User = await this.userRepository.findOneUser({ _id: id })
      //console.log("User..", User);

      license = req && req.files ? req.files['license'] : []
      idProof = req && req.files ? req.files['idProof'] : []

      if (idProof) {
        const idProofpaths = idProof.map((idProof) => {
          const split = idProof.path.split('public/')
          if (split) {
            return { path: split[1] }
          }
        })

        //console.log("idProofpaths", idProofpaths);

        update['documents'] = {
          idProof: 'idProof',
          idProofpath: idProofpaths[0].path,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: User['documents'].licensepath,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      }
      if (license) {
        const paths = license.map((license) => {
          const split = license.path.split('public/')
          if (split && split[1]) {
            return { path: split[1] }
          }
        })
        //console.log("paths", paths);
        update['documents'] = {
          idProof: 'idProof',
          idProofpath: User['documents'].idProofpath,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      }
      if (idProof && license) {
        const idProofpaths = idProof.map((idProof) => {
          const split = idProof.path.split('public/')
          if (split) {
            return { path: split[1] }
          }
        })

        //console.log("idProofpaths", idProofpaths);

        const paths = license.map((license) => {
          const split = license.path.split('public/')
          if (split && split[1]) {
            return { path: split[1] }
          }
        })

        update['documents'] = {
          idProof: 'idProof',
          idProofpath: idProofpaths[0].path,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      }

      if (
        idProof &&
        idProofNumber &&
        license &&
        licenseNumber &&
        licenseIssuedDate &&
        licenseExpiryDate
      ) {
        const idProofpaths = idProof.map((idProof) => {
          const split = idProof.path.split('public/')
          if (split) {
            return { path: split[1] }
          }
        })

        //console.log("idProofpaths", idProofpaths);

        const paths = license.map((license) => {
          const split = license.path.split('public/')
          if (split && split[1]) {
            return { path: split[1] }
          }
        })

        update['documents'] = {
          idProof: 'idProof',
          idProofpath: idProofpaths[0].path,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      } else if (
        idProof &&
        idProofNumber &&
        licenseNumber &&
        licenseIssuedDate &&
        licenseExpiryDate
      ) {
        const idProofpaths = idProof.map((idProof) => {
          const split = idProof.path.split('public/')
          if (split) {
            return { path: split[1] }
          }
        })

        update['documents'] = {
          idProof: 'idProof',
          idProofpath: idProofpaths[0].path,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: User['documents'].licensepath,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      } else if (
        license &&
        licenseNumber &&
        licenseIssuedDate &&
        licenseExpiryDate
      ) {
        const paths = license.map((license) => {
          const split = license.path.split('public/')
          if (split && split[1]) {
            return { path: split[1] }
          }
        })

        update['documents'] = {
          idProof: 'idProof',
          idProofpath: User['documents'].idProofpath,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: paths[0].path,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      } else {
        update['documents'] = {
          idProof: 'idProof',
          idProofpath: User['documents'].idProofpath,
          idProofNumber: idProofNumber,
          license: 'Licence',
          licensepath: User['documents'].licensepath,
          licenseNumber: licenseNumber,
          licenseIssuedDate: licenseIssuedDate,
          licenseExpiryDate: licenseExpiryDate,
        }
      }

      console.log('Final UPDATE User REQ ..........', update)
      const result = await this.userRepository.update({ id }, update)
      if (result) {
        return {
          success: true,
          message: 'Supplier Details updated successfully',
          data: result,
        }
      } else {
        return {
          success: false,
          message: 'Could not update',
          data: null,
        }
      }
    } catch (e) {
      console.log('error ', e.message)
      return { success: false, message: 'Something went wrong', data: null }
    }
  }

  //@UseBefore(authorizeAction("user", "update"))
  @Delete('/')
  async deleteSupplier(@Body() body: any, @Res() res: any) {
    try {
      let { ids } = body
      ids = ids && typeof ids === 'object' && ids instanceof Array ? ids : [ids]
      const result = await this.userRepository.softDelete(ids)
      return {
        success: true,
        message: 'user deleted successfully',
        data: result,
      }
    } catch (e) {
      console.log('Error', e)
      return { success: false, message: e.message, data: null }
    }
  }

  @Get('/check-avalibility')
  async checkAvalibility(@QueryParams() params: any, @Res() res: any) {
    try {
      let { type, value } = params
      type =
        typeof type === 'string' && ['username', 'email'].indexOf(type) > -1
          ? type
          : ''
      value = typeof value === 'string' && value ? value : ''

      if (type && value) {
        const result = await this.userRepository.countDocs({ [type]: value })
        return res.send({
          success: true,
          message: 'Checked',
          data: { available: result === 0 },
        })
      }

      return res.status(200).send({
        success: false,
        message: 'Could not check availibility',
        data: { available: false },
      })
    } catch (e) {
      console.log('Could not check', e)
      return res
        .status(500)
        .send({ success: false, message: e.message, data: null })
    }
  }
}
