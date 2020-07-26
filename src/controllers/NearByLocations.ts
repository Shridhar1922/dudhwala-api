import {
    Post,
    Get,
    Put,
    Delete,
    JsonController,
    Authorized,
    Body,
    Res,
    UseBefore,
    Patch,
    Param,
    QueryParams,
    Req
  } from "routing-controllers";
  import { nearByRepository } from "../repositories/nearbyRepository";


  @JsonController("/location")


  export class NearByController {
    constructor(public nearbyRepository: nearByRepository) {
      this.nearbyRepository = new nearByRepository();
    }


  // @Get("/")
  // async get() {
  //   try {

  //       const result = this.nearbyRepository.findAll();
  //    if (result)
  //    {
  //       return {
  //           success: true,
  //           message: "Car type",
  //           data: result
  //         };

  //    }
      
  //   } catch (e) {
  //     return { success: false, message: "Something went wrong", data: null };
  //   }
  // }

    
    


}

 
  
  
 