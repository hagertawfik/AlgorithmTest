const cache = {}
async function request(endpoint) {
    if (cache[endpoint]) {
        return cache[endpoint]
    }
    let myResponse = await fetch(`http://localhost:5000/${endpoint}`)
    const json = await myResponse.json();
    cache[endpoint] = json
    return json
}
async function getAlldata() {
    let finalResult = await request('energy/getalldata')
    let arrOfObj = finalResult.energy;
    let arr = arrOfObj.map(object => object.name);
    return arr
}
async function getLevel(node) {
    let Result = await request(`energy/getlevel/${node}`)
    let level = Result.level[0].level;
    return level;
}
async function getDomain(node) {
    let Result = await request(`energy/getDomain/${node}`)
    let { domain } = Result;
    let myDomain = domain[0].domain
    return myDomain;
}
async function getSubDomain(node) {
    let Result = await request(`energy/getSubDomain/${node}`)
    let { subDomain } = Result;
    let mySubDomain = subDomain[0].subDomain
    return mySubDomain;
}
async function getConcept(node) {
    let Result = await request(`energy/getConcept/${node}`)
    let { concept } = Result;
    let myConcept = concept[0].concept
    return myConcept;
}
async function getParent(node) {
    let finalResult = await request(`energy/getparent/${node}`)
    if (finalResult.parentName != null) {
        return finalResult.parentName.name;
    }
    else {
        return null;
    }
}
async function getChildren(node) {
    let finalResult = await request(`energy/getchildren/${node}`)
    if (finalResult.message == "Done") {
        let arrOfObj = finalResult.childrenNames;
        let arrayOfChildren = arrOfObj.map(object => object.name);
        return arrayOfChildren
    }
    else {
        return null;
    }
}
async function getCharcter(node) {
    let finalResult = await request(`energy/getcharacteristics/${node}`)
    return finalResult.characteristics[0].characteristics
}
async function getinstance(node) {
    let finalResult = await request(`energy/getexamples/${node}`)
    finalResult.examples[0].examples.forEach(element => {
    });
}
async function ComplexityCompare(node1, node2) {
    let node1Parents = await getAllNodeParents(node1)
    let node2Parents = await getAllNodeParents(node2)
    let comp = [...node1Parents, ...node2Parents, node1, node2]
    let newCompareComp = new Set(comp)
    let arr = Array.from(newCompareComp);
    return arr.length;
}
async function ComplexityRelate(node1, node2) {
    let common = await getCommonParents(node1, node2)
    return common.length;
}
async function ComplexityContrast(node1, node2) {
    let diffferent = await getDifferentParents(node1, node2)
    if (diffferent.length === 1) {
        let diff = [...diffferent]
        return diff.length;
    }
    else {
        let diff = [...diffferent[0], ...diffferent[1]]
        return diff.length;
    }
}
async function getAllNodeParents(node) {
    let parents = []
    let pointer = node
    while (pointer) {
        pointer = await getParent(pointer)
        if (pointer != null) {
            parents.push(pointer)
        }
    }
    return parents
}
async function getNodeAndParentsCharecteristics(node) {
    let nodeParents = await getAllNodeParents(node)
    let Charecters = []
    for (let i = 0; i < nodeParents.length; i++) {
        let parentCharacters = await getCharcter(nodeParents[i])
        Charecters.push(...parentCharacters)
    }
    Charecters.push(...await getCharcter(node))
    return Charecters;
}
async function getCommonParents(node1, node2) {
    let node1Parents = await getAllNodeParents(node1);
    let node2Parents = await getAllNodeParents(node2);
    let CommonParents = []
    if (node1Parents.length === 0 || node2Parents.length === 0) {
        CommonParents.push("energy")
    }
    else {
        for (let i = 0; i < node1Parents.length; i++) {
            for (let j = 0; j < node2Parents.length; j++) {
                if (node1Parents[i] === node2Parents[j]) {
                    CommonParents.push(node1Parents[i])
                }
            }
        }
    }
    return CommonParents
}
async function getDifferentParents(node1, node2) {
    let node1Parents = await getAllNodeParents(node1);
    let node2Parents = await getAllNodeParents(node2);
    let differerentParentsofNode1 = []
    let differerentParentsofNode2 = []
    if (node1Parents.includes(node2)) {
        return [node1];
    }
    else if (node2Parents.includes(node1)) {
        return [node2];
    }
    else {
        for (let i = 0; i < node1Parents.length; i++) {
            for (let j = 0; j < node2Parents.length; j++) {
                if (node1Parents[i] !== node2Parents[j]) {
                    differerentParentsofNode1.push(node1Parents[i])
                    differerentParentsofNode2.push(node2Parents[j])
                }
            }
        }
        let newDiff1 = new Set(differerentParentsofNode1)
        let newDiff2 = new Set(differerentParentsofNode2)
        let arr1 = Array.from(newDiff1);
        let arr2 = Array.from(newDiff2);
        let common = await getCommonParents(node1, node2)
        arr1.push(node1)
        arr2.push(node2)
        for (let i = 0; i < arr1.length; i++) {
            for (let j = 0; j < common.length; j++) {
                if (arr1[i] === common[j]) {
                    arr1.splice(i, 1)
                }
            }
        }
        for (let i = arr2.length - 1; i >= 0; i--) {
            for (let j = 0; j < common.length; j++) {
                if (arr2[i] === common[j]) {
                    arr2.splice(i, 1)

                }
            }
        }
        return [arr1, arr2]
    }
}
async function navigate2() {
    const typesOfComparison = ["compare", "relate", "contrast"];
    const nodes = await getAlldata();
    for (let i = 0; i < nodes.length; i++) {
        const pointer = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
            const otherNode = nodes[j]
            for (let d = 0; d < typesOfComparison.length; d++) {
                const typeOfComparison = typesOfComparison[d];
                let questionStyle = (typeOfComparison + "  between  " + pointer + " and " + otherNode);
                let Domain = await getDomain(pointer)
                let subDomain = await getSubDomain(pointer)
                let concept = await getConcept(pointer)
                let activityCategories = "comparing"
                if (typeOfComparison === "compare") {
                    let nod1AndParentChar = await getNodeAndParentsCharecteristics(pointer)
                    let nod2AndParentChar = await getNodeAndParentsCharecteristics(otherNode)
                    let newCompare1 = await getAllNodeParents(pointer)
                    let newCompare2 = await getAllNodeParents(otherNode)
                    let new1 = [pointer, ...newCompare1]
                    let new2 = [otherNode, ...newCompare2]
                    let answer = `Answer is :Characterestics of ${pointer} is ${nod1AndParentChar} And Characterestics of ${otherNode} is ${nod2AndParentChar} `
                    let complexity = await ComplexityCompare(pointer, otherNode)
                    const objectQuestion = {
                        questionStyle: questionStyle,
                        complexity: complexity,
                        domain: Domain,
                        subDomain: subDomain,
                        concept: concept,
                        activityCategories: activityCategories,
                        answer: answer,
                        node1:pointer,
                        node2:otherNode
                    }
            console.log(objectQuestion);
                }
                else if (typeOfComparison === "relate") {
                    let commonParents = await getCommonParents(pointer, otherNode)
                    const commonParentsCharacters = []
                    for (let i = 0; i < commonParents.length; i++) {
                        let common = await getCharcter(commonParents[i])
                        commonParentsCharacters.push(...common)
                    }
                    let answer = `Answer is : Common characteristics between ${pointer} And ${otherNode} is ${commonParentsCharacters}  `
                    let complexity = await ComplexityRelate(pointer, otherNode)
                    const objectQuestion = {
                        questionStyle: questionStyle,
                        complexity: complexity,
                        domain: Domain,
                        subDomain: subDomain,
                        concept: concept,
                        activityCategories: activityCategories,
                        answer: answer,
                        node1:pointer,
                        node2:otherNode
                    }
                    console.log(objectQuestion);
                }
                else if (typeOfComparison === "contrast") {
                    let answers = await getDifferentParents(pointer, otherNode)
                    const node1Character = []
                    const node2Character = []
                    if (answers.length === 1) {
                        for (let i = 0; i < answers.length; i++) {
                            let node1Char = await getCharcter(answers[i])
                            node1Character.push(...node1Char)
                        }
                    }
                    else {
                        let node1path = answers[0]
                        let node2path = answers[1]
                        for (let j = 0; j < node1path.length; j++) {
                            let node1Char = await getCharcter(node1path[j])
                            node1Character.push(...node1Char)
                        }
                        for (let j = 0; j < node2path.length; j++) {
                            let node2Char = await getCharcter(node2path[j])
                            node2Character.push(...node2Char)
                        }
                    }
                    let answer = `Answer is :Characterestics of ${pointer} is ${node1Character} And Characterestics of ${otherNode} is ${node2Character} `
                    let complexity = await ComplexityContrast(pointer, otherNode)
                    const objectQuestion = {
                        questionStyle: questionStyle,
                        complexity: complexity,
                        domain: Domain,
                        subDomain: subDomain,
                        concept: concept,
                        activityCategories: activityCategories,
                        answer:answer,
                        node1:pointer,
                        node2:otherNode
                    }
                    console.log(objectQuestion);
                }
            }
        }
    }
}
navigate2();