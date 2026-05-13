import { IPcmProps } from "../../components/IPcmProps";
import SPCRUDOPS from '../DAL/spcrudops';
import { IUserProfile } from '../interface/IUserProfile';


export interface UserProfileOps {
    getLoggUserProfile(props: IPcmProps): Promise<IUserProfile>;
}

export default function LoggUserProfileOps() {
    const spCrudOps = SPCRUDOPS();
        const getLoggUserProfile = async (props: IPcmProps): Promise<IUserProfile> => {
            return await (await spCrudOps).currentProfile(props).then(results => {
                    let brr: Array<IUserProfile> = new Array<IUserProfile>();
                    if(results !== undefined){
                        brr.push({
                            AccountName: results.AccountName,
                            
                            UserProfileProperties:results.UserProfileProperties!==undefined?results.UserProfileProperties:[],
                            Location:results.UserProfileProperties.find((prop: { Key: string; }) => prop.Key === 'Office')?.Value || "Location not found",
                            FirstName:results.UserProfileProperties.find((prop: { Key: string; }) => prop.Key === 'FirstName')?.Value || "FirstName not found"
                        });
                    }
                    return brr[0];
 
                        
                    
                }
                );
        //});
    };





    return {
        getLoggUserProfile
    };
}