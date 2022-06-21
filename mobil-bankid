// ==UserScript==
// @name         Mobil BankID
// @namespace    http://fatso83.github.io/
// @version      1
// @description  Universell bankidpålogging
// @author       You
// @match        file:///*
// @match        https://secure.sbanken.no/Authentication/BankIdMobile
// @match        https://login.bankid.no/*
// @match        https://XXXid.storebrand.no/*
// @match        https://signicat.storebrand.no/std/method/storebrand.auth/*/client
// @grant GM.setValue
// @grant GM.getValue
// @grant unsafeWindow
// @run-at document-idle
// ==/UserScript==
// https://developer.chrome.com/docs/extensions/mv3/match_patterns/

(async () => {
    if(typeof GM.getValue === 'undefined') {
        console.log("Not running in Greasemonkey? Quitting.")
        return;
    }

    const lastStart = await GM.getValue('lastStart')
    GM.setValue('lastStart', Date.now())
    if ((Date.now() - lastStart) < 2000) {
        console.log('Less than a second since last time. Chill');
        return;
    }

    const phoneProc = GM.getValue('phone', null)
    const birthDateProc = GM.getValue('birthDate', null)

    console.log('Running Mobile BankID logon on ' + location.href);

    let phoneNumber = await phoneProc;
    let birthDate = await birthDateProc;
    if(!phoneNumber){
        phoneNumber = window.prompt("Input phone number, 8 digits");
        birthDate = window.prompt("Input birth date, 6 digits");
        GM.setValue('phone', phoneNumber);
        GM.setValue('birthDate', birthDate);
    }

    const providers = [SBanken, BankIdDotNo,Storebrand].map(createProvider);
    const provider = getProvider(location.href);
    const observer = new MutationObserver(function() {
        console.log("Mutation observed :)");
        main();
    });
    let attempts = 0;
    let phoneElem, birthDateElement;

    if(!provider.usePolling){
        // This is supposed to work on multiple sites, so cannot get more specific
        observer.observe(elementThatChanges(), {subtree: true, childList: true});
    }

    if(!provider) {
        console.log(`Found no provider matching ${location.href}`);
        return;
    } else {
        console.log(`Matched provider ${provider.name} on ${location.href}`);
    }

    main();

    function main(){
        phoneElem = provider.phoneElement();
        if (!phoneElem) {
            console.log("No input element for phone number found, yet", unsafeWindow);
            if(++attempts == 5) {
                console.log(`Quitting after ${attempts}. Trying to select something in an iframe ? :(`);
                return;
            }

            if(provider.usePolling) {
                console.log("Set to use polling: waiting some millis");
                setTimeout(main, 200);
            }
            return;
        }
        observer.disconnect();

        try {
            phoneElem.value = phoneNumber;

            birthDateElement = provider.birthDateElement();
            birthDateElement.value = birthDate;

            submit(provider);
        } catch (err) {
            console.error("Some error occurred", err);
            return "no luck :(";
        }
    }

    function elementThatChanges(){
        if(provider.elementThatChanges) {
            const elem = provider.elementThatChanges();
            if (!elem) throw new Error("Ooooh, did not manage to find that element ...");
        }
        return document.body;
    }

    function submit(provider) {
        console.log('submitting', phoneElem, birthDateElement);
        //console.log('todo submit');
        //return;

        if(provider.submit) provider.submit();
        else {
            provider.phoneElement().form.submit();
        }
    }

    function getProvider(url) {
        return providers.find(p => p.match(url));
    }

    function createProvider(p) {
        const provider = p({phoneNumber,birthDate});
        provider.name = p.name;
        return provider;
    }

    function SBanken({phoneNumber, birthDate}){
        return {
            phoneElement(){
                return document.getElementById('MobilePhone');
            },
            birthDateElement(){
                return document.getElementById('BirthDate');
            },
            match(url){
                return url.match('https://secure.sbanken.no/Authentication/BankIdMobile')
            }
        }
    }

    // This provider does not work due to too much reliance on Angular and not respecting form.submit() ...
    function Storebrand({phoneNumber, birthDate}){
        return {
            // usePolling: true,
            phoneElement(){
                return document.getElementById('bidm_phone');
            },
            birthDateElement(){
                return document.getElementById('bidm_birth');
            },
            match(url){
                return url.match('https://signicat.storebrand.no/.*/client');
                //return url.match('https://id.storebrand.no')
            },
// Unfortunately, we get hit by the Same-Origin policy, so need to revert to polling
//            elementThatChanges(){
//                return document.querySelector('#bankid-container iframe');
//            }
        }
    }

    function BankIdDotNo({phoneNumber, birthDate}){
        return {
            phoneElement(){
                return document.querySelector('input[type="tel"][maxlength="8"]')
            },
            birthDateElement(){
                return document.querySelector('input[type="tel"][maxlength="6"]')
            },
            match(url){
                return url.match('https://login.bankid.no')
            }
        }
    }
})();
