import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import classNames from 'classnames';
import { event } from 'cypress/types/jquery';
import { Person } from './types/Person';

export const App: React.FC = () => {
  const [query, setQuery] = useState('');

  const [isFocused, setIsFocused] = useState(false);
  const [person, setSelectedPerson] = useState<Person>();

  function debounce(callback: Function, delay: number) {
    let timerId = 0;

    return (...args: any) => {
      window.clearTimeout(timerId);

      timerId = window.setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }
  const [appliedSearch, setAppliedSearch] = useState('');

  const applySearch = useCallback(debounce(setAppliedSearch, 300), []);

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    applySearch(event.target.value);
    setSelectedPerson(undefined);
  }
  const people = [...peopleFromServer];

  const filteredPeople = useMemo(() => {
    return people.filter(person =>
      person.name.toLocaleLowerCase().includes(appliedSearch.toLocaleLowerCase()),
    );
  }, [appliedSearch, peopleFromServer]);

  console.log('Rendering');
  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {person
            ? `${person.name} (${person.born} - ${person.died})`
            : 'No selected person'}
        </h1>

        <div
          className={classNames(
            'dropdown',
            isFocused === true ? 'is-active' : '',
          )}
        >
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={query}
              onChange={event => handleTextChange(event)}
              onFocus={() => setIsFocused(true)}
              onBlur={query.length === 0 ? () => setIsFocused(false) : () => {}}
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            {filteredPeople.length !== 0 && (
              <div className="dropdown-content">
                {filteredPeople.map(person => (
                  <div
                    className="dropdown-item"
                    data-cy="suggestion-item"
                    key={person.slug}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <p
                      className={classNames(
                        person.sex === 'f'
                          ? 'has-text-danger'
                          : 'has-text-link',
                      )}
                    >
                      {person.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {filteredPeople.length === 0 && (
              <div
                className="notification is-danger is-light mt-3 is-align-self-flex-start"
                role="alert"
                data-cy="no-suggestions-message"
              >
                <p className="has-text-danger">No matching suggestions</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
