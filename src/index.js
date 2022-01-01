import {EMPTY, fromEvent, mergeMap} from 'rxjs';
import {catchError, map, distinctUntilChanged, debounceTime, switchMap, tap, filter} from 'rxjs/operators';
import {ajax} from 'rxjs/ajax';

const url = 'https://api.github.com/search/users?q=';

//Get input element from index.html
const search = document.getElementById('search');
const result = document.getElementById('result');

//create observable from input event
const stream$ = fromEvent(search, 'input')
    .pipe(
        //Get input value from event
        map(e => {
            return e.target.value;
        }),
        //Get last cached emmit data after debounce time
        debounceTime(1000),
        //Emit only distinct changes
        distinctUntilChanged(),
        //Add operator for side effect. This operator is cleaner for other operators. Other can be without side-effects
        tap(() =>  result.innerHTML = ''), //Cool for debug tap(console.log)
        //filtering for empty values
        filter(value => value.trim()),
        //Create new observable from exist. INPUT STRING to AJAX RESPONSE
        switchMap(v => ajax.getJSON(url + v)
            //Add error handler for ajax request
            .pipe(
                catchError(err => EMPTY)
            )
        ),
        //Get only necessary data from response
        map(response => response.items),
        //Create by one subscribe for every item. Every item is separate observable now
        mergeMap(items => items)
    );

stream$.subscribe(user => {
    console.log(user);
    const html = `
            <div class="card">
                <div class="card-image">
                    <img src="${user.avatar_url}"/>
                    <span class="card-tittle">${user.login}</span>
                </div>
                <div class="card-action">
                    <a href="${user.html_url}" target="_blank">OPEN GITHUB</a>
                </div>
            </div>`
    result.insertAdjacentHTML('beforeend', html);
})