const storage = require('./../../storage');
const track = require('./../../track');

module.exports = ($, placeholder) => {
    placeholder.on('click', '[data-survey-tool-action="create-new-assessment"]', (event) => {
        const surveyId = storage.getCurrent($, storage.KEYS.SURVEY_ID);
        const currentAssessmentId = storage.getCurrent($, storage.KEYS.ASSESSMENT_ID);
        const questionnaire = storage.getCurrent($, storage.KEYS.QUESTIONNAIRES)[surveyId];
        const assessmentId = storage.createAssessment(surveyId, questionnaire);

        // Assign the current info on the page to the new assessment.

        const assessment = storage.getAssessment(surveyId, assessmentId);
        if (currentAssessmentId) {
            // Data on page belongs to the current assessment, don't copy it.
            const warpjsUser = storage.getCurrent($, storage.KEYS.USER);
            assessment.mainContact = warpjsUser ? warpjsUser.Name : '';
        } else {
            // This is a new form. Data should be considered for the new
            // assessment.
            assessment.projectName = $('#project-name').val();
            assessment.mainContact = $('#main-contact').val();
            assessment.projectEmail = $('#project-email').val();
            assessment.projectStatus = $('#project-status').val();

            if (assessment.projectEmail) {
                const projectEmailUrl = storage.getCurrent($, storage.KEYS.PROJECT_EMAIL_URL);
                window.WarpJS.proxy.post($, projectEmailUrl, {
                    fullName: assessment.mainContact,
                    projectEmail: assessment.projectEmail
                });
            }
        }
        storage.updateAssessment(surveyId, assessmentId, assessment);
        track('create-assessment', `Project: ${assessment.projectName || '<no name>'} // ${assessment.mainContact || '<no contact>'} // ${assessment.projectEmail || '<no email>'} // ${assessment.projectStatus || '<no status>'}`);

        const assessmentTemplateUrl = storage.getCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL);
        const redirectUrl = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId });
        document.location.href = redirectUrl;
    });
};
