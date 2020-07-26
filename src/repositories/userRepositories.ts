import * as mongoose from 'mongoose'
const logger = require('../libs/logger').createLogger('membership.log')

export class UserRepository {
  private collection = 'user'
  private model: any
  private defaultSearchColumn = 'username'

  constructor() {
    this.model = mongoose.model(this.collection)
  }

  query = {
    isDeleted: false,
  }
  /**
   * Store user to DB
   * @param data Object with user details
   */
  async store(data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const User = this.model(data)
        //console.log("User is", User);
        const user = await User.save()
        console.log('stored', user)
        resolve(JSON.parse(JSON.stringify(user)))
      } catch (e) {
        console.log('Error', e)
        reject(e)
      }
    })
  }

  /**
   * Find User by email
   * @param email
   */
  findByEmail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        if (email && typeof email === 'string') {
          const user: mongoose.Schematype = await this.model
            .findOne({ email, isDeleted: false })
            .populate('role', '-permissions')
            .exec()
          if (user) {
            return resolve(user.toObject())
          }
          reject({ message: 'Could not find user with this email' })
        } else {
          reject('Email ID invalid')
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Get all users paginated
   * @param params Query params
   */
  findAllPaginated(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let {
          currentPage = 1,
          pageSize = 12,
          sorter = 'updatedAt_descend',
          searchColumn = this.defaultSearchColumn,
          searchKey = '',
          userType,
        } = params
        let query = { isDeleted: false }
        if (searchColumn && searchKey) {
          query['$or'] = [
            {
              firstName: {
                $regex: '.*' + searchKey + '.*',
                $options: 'i',
              },
            },
            {
              lastName: {
                $regex: '.*' + searchKey + '.*',
                $options: 'i',
              },
            },
            {
              email: {
                $regex: '.*' + searchKey + '.*',
                $options: 'i',
              },
            },
            {
              username: {
                $regex: '.*' + searchKey + '.*',
                $options: 'i',
              },
            },
          ]
        }
        if (userType) {
          query['userType'] = userType
        }
        sorter = sorter.split('_').length >= 1 ? sorter : 'createdAt_descend'
        pageSize =
          pageSize && !isNaN(parseInt(pageSize)) ? parseInt(pageSize) : 12
        const sort = {
          [sorter.split('_')[0]]: sorter.split('_')[1] === 'descend' ? -1 : 1,
        }
        // , { isDeleted: 0, password: 0 }
        let list = await this.model
          .find(query)
          .skip((currentPage - 1) * pageSize)
          .limit(pageSize)
          .sort(sort)
          .exec()
        list = JSON.parse(JSON.stringify(list))
        //const total = await this.model
        //.countDocuments({ isDeleted: false })
        //.exec();
        const pagination = {
          current: currentPage,
          pageSize: pageSize,
          total: list.length,
        }
        return resolve({ list, pagination })
      } catch (e) {
        console.log('USER ERROR', e.message)
        reject(e)
      }
    })
  }

  findOneUser(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.model.findById(id).exec()
        if (user) {
          return resolve(JSON.parse(JSON.stringify(user)))
        } else {
          resolve(false)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  findOne({ supplier }) {
    return new Promise(async (resolve, reject) => {
      try {
        const carRecord = await this.model.findById(supplier, this.query).exec()
        if (carRecord) {
          return resolve(JSON.parse(JSON.stringify(carRecord)))
        } else {
          resolve(false)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Update user in DB
   * @param data Object with user updated details
   * @param condition condition for updating
   */
  async pushToSubDoc(condition: Object, data: Object) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = condition
        if (query['_id']) {
          query['_id'] = mongoose.Types.ObjectId(query['_id'])
        }

        const update = {
          $push: { ...data },
        }
        // mongoose.set("debug", true);
        let user = await this.model.findOneAndUpdate(query, update, {
          new: true,
        })
        user = JSON.parse(JSON.stringify(user))
        delete user.password
        resolve(user)
      } catch (e) {
        reject(e)
      }
    })
  }

  async update(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition['id']) {
          condition['_id'] = mongoose.Types.ObjectId(condition['id'])
          delete condition['id']
        }
        let update = {}

        update['$set'] = data
        const cartype = await this.model.findOneAndUpdate(condition, update, {
          new: true,
        })

        resolve(JSON.parse(JSON.stringify(cartype)))
      } catch (e) {
        reject(e)
      }
    })
  }

  // async updateUserWithIMG(condition: Object, data: Object, key: string = null) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       if (condition["id"]) {
  //         condition["_id"] = mongoose.Types.ObjectId(condition["id"]);
  //         delete condition["id"];
  //       }
  //       let update = {};

  //       if (data["images"]) {
  //         update["$push"] = { images: data["images"] };
  //         delete data["images"];
  //       }
  //       update["$set"] = data;

  //       const carUpdateRequest = await this.model.findOneAndUpdate(
  //         condition,
  //         update,
  //         {
  //           new: true
  //         }
  //       );
  //       resolve(JSON.parse(JSON.stringify(carUpdateRequest)));
  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // }

  /* Approve supplier API for admin update query */
  async updateSupplierStatus(
    condition: Object,
    data: Object,
    key: string = null,
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition['id']) {
          condition['_id'] = mongoose.Types.ObjectId(condition['id'])
          delete condition['id']
        }
        let update = {}

        update['$set'] = data
        const supplier = await this.model.findOneAndUpdate(condition, update, {
          new: true,
        })

        resolve(JSON.parse(JSON.stringify(supplier)))
      } catch (e) {
        reject(e)
      }
    })
  }

  softDelete(ids, isDeleted = true) {
    return new Promise(async (resolve, reject) => {
      try {
        let docids = ids.map((id) => {
          return mongoose.Types.ObjectId(id)
        })
        const result = await this.model.updateMany(
          { _id: { $in: docids } },
          { $set: { isDeleted: true } },
        )
        resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }

  findUsersCount() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {
          isDeleted: false,
        }

        let list = await this.model.find(query).exec()
        //console.log("LIST",list)

        list = JSON.parse(JSON.stringify(list))
        const userTotal = await this.model.countDocuments({
          isDeleted: false,
          userType: 'user',
        })
        const supplierTotal = await this.model
          .countDocuments({ isDeleted: false, userType: 'supplier' })
          .exec()
        const jsObj = {
          users: userTotal,
          suppliers: supplierTotal,
        }
        return resolve(jsObj)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   * Find User by email
   * @param email
   */
  countDocs(condition) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition['_id']) {
          condition['_id'] = mongoose.Types.ObjectId(condition['_id'])
        }
        if (condition && typeof condition === 'object') {
          const result = await this.model.countDocuments(condition).exec()
          return resolve(result)
        } else {
          reject('Email ID invalid')
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  async updateImages(condition: Object, data: Object, key: string = null) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition['id']) {
          condition['_id'] = mongoose.Types.ObjectId(condition['id'])
          delete condition['id']
        }

        console.log('condition', condition)
        console.log('data', data)
        let update = {}
        update['$set'] = data

        const removeImageRequest = await this.model.findOneAndUpdate(
          condition,
          data,
        )
        resolve(JSON.parse(JSON.stringify(removeImageRequest)))
      } catch (e) {
        reject(e)
      }
    })
  }

  findOneUserForforgotPassword(condition) {
    return new Promise(async (resolve, reject) => {
      try {
        if (condition['_id']) {
          condition['_id'] = mongoose.Types.ObjectId(condition['_id'])
        }
        if (condition && typeof condition === 'object') {
          let user = await this.model
            .aggregate([
              { $match: condition },
              {
                $lookup: {
                  localField: 'role',
                  foreignField: '_id',
                  as: 'roles',
                  from: 'roles',
                },
              },
              {
                $lookup: {
                  localField: 'membershipId',
                  foreignField: 'membershipId',
                  from: 'memberships',
                  as: 'memberships',
                },
              },
              {
                $lookup: {
                  localField: 'referredBy',
                  foreignField: 'referralCode',
                  from: 'users',
                  as: 'referred',
                },
              },
              {
                $project: {
                  'roles.permissions': 0,
                  'roles.isDeleted': 0,
                  'memberships.user': 0,
                  isDeleted: 0,
                  password: 0,
                },
              },
            ])
            .exec()
          if (user) {
            user = JSON.parse(JSON.stringify(user))
            user = user[0]
            if (user && user.roles && user.roles.length) {
              user.role = user.roles[0]
              delete user.roles
            }
            if (user && user.memberships && user.memberships.length) {
              user.membership = user.memberships[0]
              delete user.memberships
            }
            if (
              user &&
              user.referred &&
              user.referred.length &&
              user.referredBy
            ) {
              user.referredBy = user.referred[0]
              delete user.referred
            }
            return resolve(user)
          }
          reject({ message: 'Could not find user with this details' })
        } else {
          reject('Email ID invalid')
        }
      } catch (e) {
        console.log('Error fetching user', e.message)
        reject(e)
      }
    })
  }
}
