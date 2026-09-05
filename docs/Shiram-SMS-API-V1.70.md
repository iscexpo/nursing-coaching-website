Page | 1 Shiram System SMS API Documentation
Shiram System SMS API Documentation (version 1.70)
According to BTRC Regulation, All messages must be in Bangla.
Url: https://smsapi.shiramsystem.com/user_api/
Request Method [POST]
The server only handles “POST” (HTTP FORM URL) request and nothing more. So to send
request you must send a “POST” request with its associated parameter.
Parameters
The api contains only these parameters given below.

- email (string)
- password (string)
- method (string: available values are get_balance, send_sms, send_multi_sms,
  account_recharge and report)
- mask (string: Mask name, dedicated number or ‘Non-Masking’ for without
  masking)
- mobile (array: starts with 88, ie: 8801711000000, 8801811000000 etc)
- message (string: message body plain English or bangla)
- ids (array: sent SMSs’ ids)
- data (string in format of JSON text)
- amount (decimal number)
- recharge_email (string)
  To get balance you need only 3parameter: email, password & method (get_balance)
  To send sms you need 6 parameters: email, password, method (send_sms), mask, mobile
  & message.
  Return:
  It always returns JSON encoded data from the server. The returned json parameter
  has several keys & values in it. Details are given below with example with output value.
  Restrictions:
  Page | 2 Shiram System SMS API Documentation
- Maximum 100 mobile numbers can be added in a request.
- Maximum 100 ids can be added in a request to retrieve report.
- Only POST is allowed.
- Return format will always be in JSON format.
- Mobile number is 13 Digits meaning you’ve to add 88 at the beginning of every
  number.
- Minimum recharge amount is 1,000 tk and maximum recharge amount is 20,000tk
  Error Code List:
  Error
  Code Message
  0 Success
  11 Only POST is allowed.
  12 All parameter not given.
  13 Invalid method parameter given.
  14 Maximum number of data exceeded for one request.
  15 Invalid Mask name given.
  16 Invalid mobile number given. Please check. Only Mobile number allowed with 88 and 13
  digits.
  17 Message length exceeds the maximum allowed length.
  21 No user found with that email address.
  22 Invalid password given.
  23 Not sufficient balance is available to send sms. Please recharge.
  24 User status is not active.
  25 Not sufficient balance is available to send sms. Please contact admin.
  26 System error while calculating cost. Please contact admin.
  31 Invalid parameter exists in the request.
  32 Parameter data type didn't match.
  33 Invalid JSON data format in data parameter.
  41 The given credential is not a parent company credential.
  42 Invalid recharge amount given. The given amount is not a decimal/float number.
  43 Minimum recharge amount is 1,000 and maximum is 20,000.
  44 No account found with given recharge email address.
  45 Given recharge account is not active.
  46 Given recharge account is not a rechargeable company account through api.
  47 Given recharge email account does not belong to a company under your company.
  100 Database error. Please try later.
  101 No data found for rate.
  Page | 3 Shiram System SMS API Documentation
  102 System error. Contact admin.
  103 Data inserted but cannot provide associated ids. Please check portal for this campaign.
  111 SMS must be unicode (Bangla).
  Get Balance:
  Url: https://smsapi.shiramsystem.com/user_api/
  Method: POST
  Fields:
  email : something@something.com (your email address used for account)
  password: XXXXXXXXXX (your password)
  method: get_balance
  Return Parameter:
  status: (bool) true/False
  error_code: (int) any error code
  message: (string)message associated with code
  balance: (float) balance amount (if all ok)
  Return Value: JSON response
  {“status”:true,”error_code”:0, ”message”:”Success”,”balance”:14.12} if all is ok
  or
  {“status”:false,”error_code”:13,”message”: “Invalid method parameter given “} if error
  occurred.
  Page | 4 Shiram System SMS API Documentation
  Example:

<?php
$url = "https://smsapi.shiramsystem.com/user_api/";
$post = array(
 "email" => "example@example.com",
 "password" => "XXXXXX",
 "method" => "get_balance",
);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$result = curl_exec($ch);
echo $result;
?>

This code will give you this output given below:
{"status":true,"error_code":0,"balance":916.06,"message":"Success"}
Page | 5 Shiram System SMS API Documentation
Send SMS:
Url: https://smsapi.shiramsystem.com/user_api/
Method: POST
Fields:
email : something@something.com (your email address used for account)
password: XXXXXXXXXX (your password)
method: send_sms
mask: (Mask name, dedicated number or ‘Non-Masking’ for without masking)
mobile: array of mobile numbers with leading 88 with it( ie: 8801711000000,
8801811000000 etc.) (Maximum 100 number at a time).
message: message text (Plain English or Bangla) (Maximum 5 sms length)
Return Parameter:
status: (bool) true/false
error_code: (int) any error code
message: (string) message associated with the code
ids: (array) array of mobile number and its server id
cost: (float) Cost of sms
sms_count: (int) number of sms has sent
Return Value: JSON response
{"status":true,"error_code":0,"ids":{"8801914201317":"6105"},"cost":0.3,"sms_count":1,
"message":"Success"} if all is ok
or
{“status”:false,”error_code”:13,”message”: “Invalid method parameter given “} if error
occurred.
Page | 6 Shiram System SMS API Documentation
Example:
<?php
$url = "https://smsapi.shiramsystem.com/user_api/";
$post = array(
 "email" => "razin223@gmail.com",
 "password" => "XXXXXXX",
 "method" => "send_sms",
 "mobile" => array("8801914201317"),
 "mask" => "Non-Masking",
 "message"=>"Test sms",
);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$result = curl_exec($ch);
echo $result;
?>

This code will give you this output given below:
{"status":true,"error_code":0,"ids":{"8801914201317":"6106"},"cost":0.3,"sms_count":1,
"message":"Success"}
Page | 7 Shiram System SMS API Documentation
Send Multiple SMS To Multiple Numbers:
Url: https://smsapi.shiramsystem.com/user_api/
Method: POST
Fields:
email : something@something.com (your email address used for account)
password: XXXXXXXXXX (your password)
method: send_multi_sms
mask: (Mask name, dedicated number or ‘Non-Masking’ for without masking)
data: JSON encoded string data with mobile and sms in it. Data format is like this
[{"mobile":"8801914201317","sms":"Test sms
1"},{"mobile":"8801711409023","sms":"Test sms 2"}]
Here “mobile” field is 13 digits of mobile number including 88 at front. "sms” field
is string of max length of 5 character length SMS. The maximum SMS at a time can
be send via “data” parameter is 100.
Return Parameter:
status: (bool) true/false
error_code: (int) any error code
message: (string) message associated with the code
ids: (array) array of mobile number and its server id
cost: (float) Cost of sms
sms_count: (int) number of sms has sent
Return Value: JSON response
{"status":true,"error_code":0,"ids":{"8801914201317":"6105"},"cost":0.3,"sms_count":1,
"message":"Success"} if all is ok or
Page | 8 Shiram System SMS API Documentation
{“status”:false,”error_code”:13,”message”: “Invalid method parameter given “} if error
occurred.
Example:
<?php
$Data = array("email" => "example@example.com", "password" => "XXXXXXXX",
"method" => "send_multi_sms", "mask" => "Non-Masking");
$Message[] = array("mobile" => "8801914201317", "sms" => "Test sms 1");
$Message[] = array("mobile" => "8801711409023", "sms" => "Test sms 2");
$Data['data'] = json_encode($Message);
$url = "https://smsapi.shiramsystem.com/user_api/";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($Data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$result = curl_exec($ch);
echo $result;
?>

This code will give you this output given below:
{"status":true,"error_code":0,"ids":{"8801914201317":"6106"},"cost":0.3,"sms_count":1,
"message":"Success"}
Page | 9 Shiram System SMS API Documentation
SMS Report
Url: https://smsapi.shiramsystem.com/user_api/
Method: POST
Fields:
email : something@something.com (your email address used for account)
password: XXXXXXXXXX (your password)
method: report
ids: array of Ids of the server provided when sms sent vai api.
Return Parameter:
status: (bool) true/false
error_code: (int) any error code
message: (string) message associated with the code
no_of_result_found: (int) No of result found with that request.
details: (array) Contains the details of the ids given on the request.
id: message id
mobile: mobile no
status: message send status (Send/Failed, Queued etc)
time: Time when execution worked.
Return Value: JSON response
{"status":true,"error_code":0,"no_of_result_found":1,"details":[{"id":"6105","mobile":"8
801914201317","status":"Sent","time":"2018-03-26 03:58:52"}],"message":"Success"}
if all is ok or
{“status”:false,”error_code”:13,”message”: “Invalid method parameter given “} if error
occurred.
Page | 10 Shiram System SMS API Documentation
Example:
<?php
$url = "https://smsapi.shiramsystem.com/user_api/";
$post = array(
 "email" => "razin223@gmail.com",
 "password" => "XXXXXXX",
 "method" => "report",
 "ids" => array("5412"),
);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FAILONERROR, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$result = curl_exec($ch);
echo $result;
?>

This code will give you this output given below:
{"status":true,"error_code":0,"no_of_result_found":1,"details":[{"id":"6105","mobile":"8
801914201317","status":"Sent","time":"2018-03-26 03:58:52"}],"message":"Success"}
Page | 11 Shiram System SMS API Documentation
Other Language Example
Java
Dependencies:
'org.apache.httpcomponents:httpclient:4.5.13'
'com.google.code.gson:gson:2.8.6'
import java.util.ArrayList;
import java.util.List;
import org.apache.http.NameValuePair;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.message.BasicNameValuePair;
import com.google.gson.Gson;
public class sendSMS {
private class MultipleSMSData
{
public String mobile;
public String sms;
public MultipleSMSData(String mobile, String sms)
{
this.mobile = mobile;
this.sms = sms;
}
}
public String sendMultiSMS()
{
String str = "";
MultipleSMSData[] multipleSMSData = new MultipleSMSData[3];
multipleSMSData[0] = new MultipleSMSData("8801711409022", "L¨vK L¨vK L¨vK");
multipleSMSData[1] = new MultipleSMSData("8801613671066", "L¨vK L¨vK L¨vKL¨vK L¨vK L¨vK");
multipleSMSData[2] = new MultipleSMSData("8801911046898", "L¨vK L¨");
Page | 12 Shiram System SMS API Documentation
//System.out.println(new Gson().toJson(multipleSMSData));
try {
String url = "https://smsapi.shiramsystem.com/user_api/";
HttpPost post = new HttpPost(url);
List<NameValuePair> urlParameters = new ArrayList<>();
urlParameters.add(new BasicNameValuePair("email", "//TODO your registered email at shiram system"));
urlParameters.add(new BasicNameValuePair("password", "//TODO your api password from shiram
system"));
urlParameters.add(new BasicNameValuePair("method", "send_multi_sms")); //its hardcoded
urlParameters.add(new BasicNameValuePair("mask", "your registered masking at shiram system"));
urlParameters.add(new BasicNameValuePair("data", new Gson().toJson(multipleSMSData)));
post.setEntity(new UrlEncodedFormEntity(urlParameters,"UTF-8"));
post.setHeader("Content-type", "application/x-www-form-urlencoded");
post.setHeader("User-Agent", "Mozilla");
try ( CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response =
httpClient.execute(post)) {
str += EntityUtils.toString(response.getEntity());
}
} catch (Exception a) {
str = "F";
a.printStackTrace();
}
System.out.println(str);
return str;
}
public String sendSMS(java.lang.String mobile, java.lang.String text) {
String str = "";
try {
String url = "https://smsapi.shiramsystem.com/user_api/";
HttpPost post = new HttpPost(url);
List<NameValuePair> urlParameters = new ArrayList<>();
urlParameters.add(new BasicNameValuePair("email", "//TODO your registered email at shiram system"));
urlParameters.add(new BasicNameValuePair("password", "TODO your api password from shiram
system"));
urlParameters.add(new BasicNameValuePair("method", "send_sms")); //its hardcoded
urlParameters.add(new BasicNameValuePair("mask", "your registered masking at shiram system"));
urlParameters.add(new BasicNameValuePair("mobile[]", mobile));
urlParameters.add(new BasicNameValuePair("message", text));
Page | 13 Shiram System SMS API Documentation
post.setEntity(new UrlEncodedFormEntity(urlParameters,"UTF-8"));
post.setHeader("Content-type", "application/x-www-form-urlencoded");
post.setHeader("User-Agent", "Mozilla");
try ( CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response =
httpClient.execute(post)) {
str += EntityUtils.toString(response.getEntity());
}
} catch (Exception a) {
str = "F";
a.printStackTrace();
}
return str;
}
}
Page | 14 Shiram System SMS API Documentation
NodeJS
Dependencies:
Axios (npm install axios)
QS (npm install qs)
Balance
const axios = require('axios');
const qs = require('qs');
const data = {
email: 'abc@xyz.com',
password: 'xxxxx',
method:'get_balance'
};
axios.post('https://smsapi.shiramsystem.com/user_api/', qs.stringify(data))
.then((res) => {
console.log(`Status: ${res.status}`);
console.log('Body: ', res.data);
}).catch((err) => {
console.error(err);
});
Send Single Message
const axios = require('axios');
const qs = require('qs');
var Mobile = [];
Mobile.push();
const data = {
email: 'abc@gmail.com',
password: 'xxxxx',
method:'send_sms',
mobile:['8801914201317'],
mask:"Non-Masking",
message:"মাংস έবচেত ვনেত হেব ১৫ হাজার টাকা",
};
axios.post('https://smsapi.shiramsystem.com/user_api/', qs.stringify(data))
.then((res) => {
console.log(`Status: ${res.status}`);
console.log('Body: ', res.data);
}).catch((err) => {
console.error(err);
Page | 15 Shiram System SMS API Documentation
});
Send Multiple Message to Multiple Number
const axios = require('axios');
const qs = require('qs');
var MessageBody = [];
MessageBody.push({mobile:'8801914201317',sms:'মাংস έবচেত ვনেত হেব ১৫ হাজার টাকা'});
MessageBody.push({mobile:'8801711409023',sms:'১৫ হাজার টাকা মাংস έবচেত ვনেত হেব'});
const data = {
email: 'abc@gmail.com',
password: 'xxx',
method:'send_multi_sms',
mask:"Non-Masking",
data: JSON.stringify(MessageBody),
};
axios.post('https://smsapi.shiramsystem.com/user_api/', qs.stringify(data))
.then((res) => {
console.log(`Status: ${res.status}`);
console.log('Body: ', res.data);
}).catch((err) => {
console.error(err);
});
Page | 16 Shiram System SMS API Documentation
C#
Dependencies:
You'll be need to use System.Net for using this code. So import that library before use this code.
for supporting the JSON download the u need to add a dll file named Newtonsoft.Json.dll. You can download it
from https://www.newtonsoft.com/json
Send Single SMS to Multiple/Single Number
string mail = "email_address";
string pass = "Password";
string method_ = "send_sms";
string mask_ = "SEL SCHOOL";
string mobileno = "8801711409022";
string message = "test message";
string URI = "https://smsapi.shiramsystem.com/user_api/";
string myParameters = "email=" + mail + "&password=" + pass + "&method=" + method_ + "&mobile[]=" +
mobileno + "&mask=" + mask_ + "&message=" + message;
using (WebClient wc = new WebClient())
{
wc.Headers[HttpRequestHeader.ContentType] = "application/x-www-form-urlencoded";
string HtmlResult = wc.UploadString(URI, myParameters);
MessageBox.Show(HtmlResult);
}
Send Multiple SMS to multiple Number
using System;
using System.Net;
using Newtonsoft.Json;
private class MultipleSMSData
{
public string mobile;
public string sms;
public MultipleSMSData(string mobile, string sms)
{
this.mobile = mobile;
Page | 17 Shiram System SMS API Documentation
this.sms = sms;
}
}
private void method_name()
{
string mail = "useremail@gmail.com";
string pass = "123456";
string method_ = "send_multi_sms";
string mask_ = "SEL SCHOOL";
MultipleSMSData[] multipleSMSData = new MultipleSMSData[3];
multipleSMSData[0] = new MultipleSMSData("8801711409022", "হািবজািব");
multipleSMSData[1] = new MultipleSMSData("8801613671066", "খҝাক খҝাক");
multipleSMSData[2] = new MultipleSMSData("8801911046898", "hi 6898");
string URI = "https://smsapi.shiramsystem.com/user_api/";
string myParameters = "email=" + mail + "&password=" + pass + "&method=" + method_

- "&mask=" + mask_ + "&data=" +
  WebUtility.UrlEncode(JsonConvert.SerializeObject(multipleSMSData));
  using (WebClient wc = new WebClient())
  {
  wc.Headers[HttpRequestHeader.ContentType] = "application/x-www-form-urlencoded";
  string HtmlResult = wc.UploadString(URI, myParameters);
  MessageBox.Show(HtmlResult);
  }
  }
