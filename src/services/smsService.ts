import { saveParsedTransaction } from './transactionService';
import { NativeModules, NativeEventEmitter } from 'react-native';

const { SmsListenerModule } = NativeModules;
const smsEventEmitter = new NativeEventEmitter(SmsListenerModule);

let subscription: any = null;

export const startSmsListener = async () => {
  if (SmsListenerModule) {
    SmsListenerModule.start();
    
    // Subscribe to events from the native BroadcastReceiver
    if (!subscription) {
      subscription = smsEventEmitter.addListener('onSmsReceived', async (event: any) => {
        console.log("Real SMS received from native:", event);
        await saveParsedTransaction(event.sender, event.body, event.timestamp);
      });
    }
  } else {
    console.warn("SmsListenerModule is not available. Are you running the bare workflow build?");
  }
};

export const stopSmsListener = async () => {
  if (SmsListenerModule) {
    SmsListenerModule.stop();
  }
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
};

