# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing


class FreelancerEscrow(gl.Contract):

    job_title:        str
    job_requirements: str
    payment_amount:   str
    client:           str
    freelancer:       str
    deliverable_url:  str
    status:           str
    ai_verdict:       str
    ai_reasoning:     str
    ai_score:         str

    def __init__(self, job_title: str, job_requirements: str, payment_amount: str):
        self.job_title        = job_title
        self.job_requirements = job_requirements
        self.payment_amount   = payment_amount
        self.client           = str(gl.message.sender_address)
        self.freelancer       = ""
        self.deliverable_url  = ""
        self.status           = "open"
        self.ai_verdict       = ""
        self.ai_reasoning     = ""
        self.ai_score         = "0"

    @gl.public.write
    def submit_work(self, deliverable_url: str) -> typing.Any:
        if self.status != "open":
            raise Exception("Job is not open for submissions.")
        self.freelancer      = str(gl.message.sender_address)
        self.deliverable_url = deliverable_url
        self.status          = "submitted"

    @gl.public.write
    def evaluate_work(self) -> typing.Any:
        if self.status != "submitted":
            raise Exception("No work has been submitted yet.")

        requirements = self.job_requirements
        deliverable  = self.deliverable_url
        title        = self.job_title

        def check() -> str:
            try:
                page    = gl.nondet.web.get(deliverable)
                content = page.body.decode("utf-8")[:3000]
            except Exception:
                content = "[Could not fetch deliverable URL]"

            task = (
                "You are an AI escrow judge evaluating freelance work delivery.\n\n"
                "Job Title: " + title + "\n"
                "Job Requirements: " + requirements + "\n"
                "Deliverable URL: " + deliverable + "\n\n"
                "Live content fetched from the URL:\n" + content + "\n\n"
                "Decide if the work meets the requirements.\n"
                "Respond with ONLY this JSON:\n"
                "{\"verdict\": \"approved\" or \"disputed\", "
                "\"reasoning\": \"2-3 sentence explanation\", "
                "\"score\": integer 0 to 100}"
            )

            result = gl.nondet.exec_prompt(task)
            result = result.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(result)
            return json.dumps(parsed, sort_keys=True)

        output = gl.eq_principle.strict_eq(check)
        data   = json.loads(output)

        self.ai_verdict   = str(data.get("verdict",   "disputed"))
        self.ai_reasoning = str(data.get("reasoning", ""))
        self.ai_score     = str(data.get("score",     "0"))
        self.status       = self.ai_verdict

    @gl.public.view
    def get_job(self) -> str:
        return json.dumps({
            "title":        self.job_title,
            "requirements": self.job_requirements,
            "payment":      self.payment_amount,
            "client":       self.client,
            "status":       self.status,
        })

    @gl.public.view
    def get_verdict(self) -> str:
        return json.dumps({
            "verdict":     self.ai_verdict,
            "reasoning":   self.ai_reasoning,
            "score":       self.ai_score,
            "freelancer":  self.freelancer,
            "deliverable": self.deliverable_url,
        })

    @gl.public.view
    def get_status(self) -> str:
        return self.status
