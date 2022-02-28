
export interface IChatModel {
    
    clinicaId: string;

    pacientId: string;
    pacientName: string;
    medicId: string;
    medicName: string;
    pacientRequestDate: string;
    medicResponseDate: string;
    pacientSignal: string;
    medicSignal: string;
}

export class ChatModel implements IChatModel
{

    clinicaId= "6E6423FF-00F9-4142-59E3-08D608D9CCBF";
    pacientId= "";
    pacientName= "";
    medicId= "";
    medicName= "";
    pacientRequestDate= "";
    medicResponseDate= "";
    pacientSignal= "";
    medicSignal= "";

  }
