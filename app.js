const express = require('express')
const axios = require('axios')
require('dotenv').config()

const app = express()

const QUESTION_TYPES = [
  {
    name: 'LongAnswer',
    type: 'string',
  },
  {
    name: 'ShortAnswer',
    type: 'string',
  },
  {
    name: 'DatePicker',
    type: 'date',
  },
  {
    name: 'NumberInput',
    type: 'number',
  },
  {
    name: 'MultipleChoice',
    type: 'string',
  },
  {
    name: 'EmailInput',
    type: 'string',
  },
]

/*
 * @param: <String> formId
 * Calls the fillout api to get a specific form's submissions.
 */
const fetchFormData = async (formId, formQueryParams) => {
  const queryParams = new URLSearchParams(formQueryParams)
  const sanitizedQueryString = `?${queryParams}`
  const url = process.env.API_URL
  const apiKey = process.env.API_KEY

  try {
    const response = await axios.get(
      `${url}/forms/${formId}/submissions${sanitizedQueryString}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )
    const { data } = response

    return data
  } catch (error) {
    console.log(`Error getting data: ${error}`)
  }
}

app.get('/:formId/filteredResponses', async (req, res) => {
  const { formId } = req.params
  const filterCriteria = jsonParser(req.query.filter)
  //cloning req.query but removing filter
  const { filter, ...formQueryParams } = req.query
  //get submission data from fillout api, based on formID
  const submissionsData = await fetchFormData(formId, formQueryParams)

  if (typeof filterCriteria !== 'string') {
    try {
      const { responses } = submissionsData
      //perform filtering based on the filter criteria
      const filteredData = filterByCriteria(responses, filterCriteria)

      //create a new return object, else send a message that no results were found
      if (filteredData.length > 0) {
        //using the limit or setting 10 if limit is not available
        const limit = formQueryParams.limit || 10
        const pageCount = Math.ceil(filteredData.length / limit)

        const sanitizedData = {
          responses: filteredData,
          totalResponses: filteredData.length,
          pageCount: pageCount,
        }

        res.send(sanitizedData)
      } else {
        res.send(`No submissions found based on your filter criteria`)
      }
    } catch (error) {
      console.log(`There was an error: ${error}`)
    }
  } else {
    res.send(submissionsData)
  }
})

/*
 * @param: json
 * @returns: <Object>
 * Cleans up json by removing \n and \r
 * If the json string is overstringified, we parse the json string again in order to return an object
 */
const jsonParser = (json) => {
  try {
    const sanitizedJson = json.replace(/(?:\\[rn])+/g, '')
    let parsedJson = JSON.parse(sanitizedJson)

    if (typeof parsedJson === 'string') parsedJson = jsonParser(parsedJson)

    return parsedJson
  } catch (error) {
    return `There was an error`
  }
}

/*
 * @params: <String> questionType, <String|Number> questionVal, <String|Number> criteriaVal
 * @returns: <Object>
 * Converts dates that are string to Date values, else returns the existing question and criteria values
 */
const sanitizeValues = (questionType, questionVal, criteriaVal) => {
  // find the real type from QUESTION_TYPES
  const { type } = QUESTION_TYPES.find((type) => type.name === questionType)

  if (typeof questionVal == 'string' && type === 'date') {
    //convert the questionVal and criteriaVal to dates
    return {
      questionValue: Date.parse(questionVal),
      criteriaValue: Date.parse(criteriaVal),
    }
  } else {
    return { questionValue: questionVal, criteriaValue: criteriaVal }
  }
}

/*
 * Object that contains comparison functions
 * Each function receives a question value and a filter criteria value
 */
const comparisonOperators = {
  equals: (a, b) => a === b,
  does_not_equal: (a, b) => a !== b,
  greater_than: (a, b) => a > b,
  less_than: (a, b) => a < b,
}

/*
 * @params: <Array> responses - list of responses returned by the fillout api
 * @params: <Array> criteria - filter criteria
 * @returns: <Array> filtered data
 */
const filterByCriteria = (responses, criteria) => {
  //find questions where question equals the criteria list ids
  const filteredData = []
  for (const submission of responses) {
    const { questions } = submission

    //check to see if the questions meet the criteria
    questions.filter((question) => {
      let meetsCriteria = true
      criteria.some(({ id, condition, value }) => {
        if (question.id === id) {
          const { questionValue, criteriaValue } = sanitizeValues(
            question['type'],
            question['value'],
            value
          )

          meetsCriteria = comparisonOperators[condition](
            questionValue,
            criteriaValue
          )
        } else {
          meetsCriteria = false
        }
      })

      if (meetsCriteria) {
        filteredData.push(submission)
      }
    })
  }
  return filteredData
}

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log('server running')
})
