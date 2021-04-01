import requests
import re
import os
import sys

cieHeaders = {
	'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
	'Accept-Encoding': 'identity, deflate, compress, gzip, br',
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	'Accept-Language': 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3',
	'Connection': 'keep-alive',
	'Upgrade-Insecure-Requests': '1'
}

# As requests doesn't support JS, redirects stop, so a POST with the following payload is required
ciePayload = {
	"shib_idp_ls_exception.shib_idp_session_ss": "",
	"shib_idp_ls_success.shib_idp_session_ss": "false",
	"shib_idp_ls_value.shib_idp_session_ss": "",
	"shib_idp_ls_exception.shib_idp_persistent_ss": "",
	"shib_idp_ls_success.shib_idp_persistent_ss": "false",
	"shib_idp_ls_value.shib_idp_persistent_ss": "",
	"shib_idp_ls_supported": "",
	"_eventId_proceed": ""
}


def requestCieAuthPage(
		uri,
		headers,
		payload,
		maxAttempts,
		timeout):
	statusFlag = False
	nAttempts = 0
	response = None

	# Do the required attempts
	while not (nAttempts >= maxAttempts or statusFlag):
		# do the requests
		response = requests.get(
			uri, headers=headers, allow_redirects=True, timeout=timeout)
		response = requests.post(
			response.url, headers=headers, data=payload, allow_redirects=True, timeout=timeout)
		# set conditions for next step
		nAttempts += 1
		statusFlag = (response.status_code == 200)

	return response


def postSlack(
		token,
		message="Page containing CIE button unreachable",
		uri="https://slack.com/api/chat.postMessage",
		channel='#io_status'):
	slackHeaders = {
		"Content-type": "application/json",
		"Authorization": "Bearer " + token
	}

	slackPayload = {
		"text": {
			"type": "mrkdwn",
			"text": message
		},
		"channel": channel
	}

	return requests.post(
		uri, headers=slackHeaders, json=slackPayload, allow_redirects=True)


def main(uri="https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL2",
         headers=cieHeaders,
         payload=ciePayload,
         maxAttempts=5,
         pattern="apriIosUL",
         timeoutPerRequest=1):  # timeout in seconds
	cieAuthPageResponse = None
	try:
		cieAuthPageResponse = requestCieAuthPage(
			uri, headers, payload, 1, timeoutPerRequest)
		cieAuthPageResponse.raise_for_status()
		print("All it's fine")
	except requests.exceptions.RequestException as ex:
		msg = "[Fatal Error] Page containing CIE button unreachable\n\n```%s```" % str(ex)
		print(msg, file=sys.stderr)
		postSlack(os.environ.get("IO_APP_SLACK_TOKEN_CHECK_CIE_BTN", None), msg)
		sys.exit(os.EX_UNAVAILABLE)
	except Exception as ex:
		postSlack(os.environ.get("IO_APP_SLACK_TOKEN_CHECK_CIE_BTN", None),
		          "[Fatal Error] Page containing CIE button unreachable\n\n```%s```" % str(ex))
		sys.exit(os.EX_UNAVAILABLE)

	if not re.search(pattern, cieAuthPageResponse.text):
		print("[Fatal Error] Can't find CIE button JS script", file=sys.stderr)
		postSlack(os.environ.get("IO_APP_SLACK_TOKEN_CHECK_CIE_BTN",
		                         None), "Can't find CIE button JS script\n ```%s```" % cieAuthPageResponse.text)
		sys.exit(os.EX_UNAVAILABLE)


if __name__ == "__main__":
	main(uri="https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL2",
	     headers=cieHeaders,
	     payload=ciePayload,
	     maxAttempts=5,
	     pattern="apriIosUL",
	     timeoutPerRequest=5)
